import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui';
import { OrderSummary } from '../components/OrderSummary';
import { useAuth } from '../context/AuthContext';

function joinAddressLines(address1: string, address2: string) {
  return [address1.trim(), address2.trim()].filter(Boolean).join(', ');
}

export function Checkout() {
  const { items, clearCart, promoCode } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.phone || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    sameAsShipping: true,
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex');

    document.title = "CHECKOUT — NEXTHOOD STUDIO";
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (items.length === 0 && !isPaymentStep) {
      navigate('/bag');
    }
  }, [items.length, isPaymentStep, navigate]);

  useEffect(() => {
    if (document.querySelector('script[data-razorpay="true"]')) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    document.body.appendChild(script);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    const email = formData.email.trim();
    const mobile = formData.mobile.trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Valid email required';
    }
    if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Valid 10-digit number required';
    }
    
    if (!formData.address1.trim()) newErrors.address1 = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.state.trim()) newErrors.state = 'Required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Valid 6-digit pincode required';

    if (!formData.sameAsShipping) {
      if (!formData.billingAddress1.trim()) newErrors.billingAddress1 = 'Required';
      if (!formData.billingCity.trim()) newErrors.billingCity = 'Required';
      if (!formData.billingState.trim()) newErrors.billingState = 'Required';
      if (!/^\d{6}$/.test(formData.billingPincode)) newErrors.billingPincode = 'Valid 6-digit pincode required';
    }

    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Find first error and scroll to it - simplistic approach
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setOrderRef(`NH-${Math.floor(10000000 + Math.random() * 90000000)}`);
      setIsPaymentStep(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  if (isPaymentStep) {
    const handlePlaceOrder = async () => {
      setIsSubmitting(true);
      try {
        const payload = {
          id: orderRef,
          orderReference: orderRef,
          email: formData.email,
          couponCode: promoCode || undefined,
          items: items.map(({ productId, quantity, size, color }) => ({
            productId,
            quantity,
            size,
            color
          })),
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.mobile,
            addressLine: joinAddressLines(formData.address1, formData.address2),
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: 'IN'
          },
          billingAddress: formData.sameAsShipping ? {
            fullName: formData.fullName,
            phone: formData.mobile,
            addressLine: joinAddressLines(formData.address1, formData.address2),
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: 'IN'
          } : {
            fullName: formData.fullName,
            phone: formData.mobile,
            addressLine: joinAddressLines(formData.billingAddress1, formData.billingAddress2),
            city: formData.billingCity,
            state: formData.billingState,
            pincode: formData.billingPincode,
            country: 'IN'
          }
        };

        const res = await fetch('/api/orders/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error || 'Failed to create order');
        }

        const order = await res.json();
        const paymentRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });
        if (!paymentRes.ok) {
          const error = await paymentRes.json().catch(() => ({}));
          throw new Error(error.error || 'Unable to initialize payment');
        }

        const payment = await paymentRes.json();
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) throw new Error('Payment gateway is still loading. Please try again.');

        const checkout = new Razorpay({
          key: payment.keyId,
          amount: payment.amount,
          currency: payment.currency,
          name: 'NEXTHOOD STUDIO',
          description: `Order ${payment.orderReference}`,
          order_id: payment.razorpayOrderId,
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.mobile
          },
          theme: { color: '#111111' },
          modal: { ondismiss: () => setIsSubmitting(false) },
          handler: async (response: any) => {
            try {
              const verify = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              if (!verify.ok) throw new Error('Payment verification failed');
              clearCart();
              navigate(`/order-confirmation/${order.id}`);
            } catch (error) {
              console.error(error);
              alert(error instanceof Error ? error.message : 'Payment verification failed');
              setIsSubmitting(false);
            }
          }
        });
        checkout.open();
      } catch (e) {
        console.error(e);
        alert('An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="pt-32 pb-24 min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-syne text-2xl md:text-4xl font-bold uppercase mb-4">Complete Order</h1>
          <p className="font-outfit text-brand-off-white/60 mb-8">Order Reference: {orderRef}</p>
          
          <div className="bg-brand-charcoal/20 border border-brand-charcoal p-8 flex flex-col items-center justify-center text-center">
            <svg className="w-12 h-12 text-brand-white mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <h3 className="font-syne text-lg font-bold uppercase mb-2">Secure Payment</h3>
            <p className="font-outfit text-sm text-brand-off-white/60 max-w-md mx-auto mb-6">
              You will be redirected to Razorpay's secure payment window to complete your order.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setIsPaymentStep(false)} variant="outline" disabled={isSubmitting}>
                BACK
              </Button>
              <Button onClick={handlePlaceOrder} variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'OPENING PAYMENT...' : 'PAY SECURELY'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-brand-black pb-24">
      {/* Checkout Header */}
      <header className="border-b border-brand-charcoal bg-brand-near-black py-6 px-4 lg:px-12 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="font-syne text-xl font-bold tracking-widest uppercase">
          NEXTHOOD STUDIO
        </Link>
        <Link to="/bag" className="font-outfit text-xs tracking-widest uppercase text-brand-off-white hover:text-brand-white">
          Back to Bag
        </Link>
      </header>

      <div className="container mx-auto px-4 lg:px-12 pt-8 md:pt-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left: Forms */}
          <div className="w-full lg:w-7/12 xl:w-2/3">
            <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
              
              {/* Customer Info */}
              <section>
                <h2 className="font-syne text-xl font-bold uppercase tracking-wide mb-6">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input 
                      id="field-fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="FULL NAME"
                      className={`w-full bg-transparent border-b ${errors.fullName ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                    />
                    {errors.fullName && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.fullName}</span>}
                  </div>
                  <div>
                    <input 
                      id="field-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="EMAIL ADDRESS"
                      className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                    />
                    {errors.email && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.email}</span>}
                  </div>
                  <div>
                    <input 
                      id="field-mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(prev => ({ ...prev, mobile: val }));
                        if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                      }}
                      placeholder="MOBILE NUMBER (10 DIGITS)"
                      className={`w-full bg-transparent border-b ${errors.mobile ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                    />
                    {errors.mobile && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.mobile}</span>}
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="font-syne text-xl font-bold uppercase tracking-wide mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input 
                      id="field-address1"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      placeholder="ADDRESS LINE 1"
                      className={`w-full bg-transparent border-b ${errors.address1 ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                    />
                    {errors.address1 && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.address1}</span>}
                  </div>
                  <div className="md:col-span-2">
                    <input 
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      placeholder="ADDRESS LINE 2 (OPTIONAL)"
                      className="w-full bg-transparent border-b border-brand-charcoal py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors"
                    />
                  </div>
                  <div>
                    <input 
                      id="field-city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="CITY"
                      className={`w-full bg-transparent border-b ${errors.city ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                    />
                    {errors.city && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.city}</span>}
                  </div>
                  <div>
                    <select 
                      id="field-state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full bg-brand-black border-b ${errors.state ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm text-brand-off-white focus:outline-none focus:border-brand-white transition-colors`}
                    >
                      <option value="" disabled>STATE</option>
                      {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.state}</span>}
                  </div>
                  <div>
                    <input 
                      id="field-pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setFormData(prev => ({ ...prev, pincode: val }));
                        if (errors.pincode) setErrors(prev => ({ ...prev, pincode: '' }));
                      }}
                      placeholder="PINCODE"
                      className={`w-full bg-transparent border-b ${errors.pincode ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                    />
                    {errors.pincode && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.pincode}</span>}
                  </div>
                </div>
              </section>

              {/* Billing Address */}
              <section>
                <h2 className="font-syne text-xl font-bold uppercase tracking-wide mb-6">Billing Address</h2>
                <label className="flex items-center gap-3 cursor-pointer mb-6 group w-fit">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onChange={handleInputChange}
                      className="peer appearance-none w-5 h-5 border border-brand-charcoal bg-brand-near-black checked:bg-brand-white checked:border-brand-white transition-colors"
                    />
                    <svg className="absolute w-3 h-3 text-brand-black pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-outfit text-sm text-brand-off-white group-hover:text-brand-white transition-colors">Billing address same as shipping address</span>
                </label>

                {!formData.sameAsShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input 
                        id="field-billingAddress1"
                        name="billingAddress1"
                        value={formData.billingAddress1}
                        onChange={handleInputChange}
                        placeholder="BILLING ADDRESS LINE 1"
                        className={`w-full bg-transparent border-b ${errors.billingAddress1 ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                      />
                      {errors.billingAddress1 && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.billingAddress1}</span>}
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        name="billingAddress2"
                        value={formData.billingAddress2}
                        onChange={handleInputChange}
                        placeholder="BILLING ADDRESS LINE 2 (OPTIONAL)"
                        className="w-full bg-transparent border-b border-brand-charcoal py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors"
                      />
                    </div>
                    <div>
                      <input 
                        id="field-billingCity"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        placeholder="CITY"
                        className={`w-full bg-transparent border-b ${errors.billingCity ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                      />
                      {errors.billingCity && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.billingCity}</span>}
                    </div>
                    <div>
                      <select 
                        id="field-billingState"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        className={`w-full bg-brand-black border-b ${errors.billingState ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm text-brand-off-white focus:outline-none focus:border-brand-white transition-colors`}
                      >
                        <option value="" disabled>STATE</option>
                        {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.billingState && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.billingState}</span>}
                    </div>
                    <div>
                      <input 
                        id="field-billingPincode"
                        name="billingPincode"
                        value={formData.billingPincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData(prev => ({ ...prev, billingPincode: val }));
                          if (errors.billingPincode) setErrors(prev => ({ ...prev, billingPincode: '' }));
                        }}
                        placeholder="PINCODE"
                        className={`w-full bg-transparent border-b ${errors.billingPincode ? 'border-red-500' : 'border-brand-charcoal'} py-3 font-outfit text-sm placeholder:text-brand-off-white/40 focus:outline-none focus:border-brand-white transition-colors`}
                      />
                      {errors.billingPincode && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1 block">{errors.billingPincode}</span>}
                    </div>
                  </div>
                )}
              </section>

              {/* Terms */}
              <section>
                <div id="field-agreedToTerms" className={`p-4 border ${errors.agreedToTerms ? 'border-red-500 bg-red-500/5' : 'border-brand-charcoal bg-brand-near-black'} flex items-start gap-3`}>
                  <div className="relative flex items-center justify-center mt-1">
                    <input 
                      type="checkbox" 
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="peer appearance-none w-5 h-5 border border-brand-charcoal bg-brand-black checked:bg-brand-white checked:border-brand-white transition-colors cursor-pointer"
                    />
                    <svg className="absolute w-3 h-3 text-brand-black pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-outfit text-xs md:text-sm text-brand-off-white leading-relaxed">
                      By placing your order, you agree to our <Link to="/legal" className="underline hover:text-brand-white">Terms & Conditions</Link> and acknowledge our <Link to="/legal" className="underline hover:text-brand-white">Privacy Policy</Link> and applicable <Link to="/legal" className="underline hover:text-brand-white">Return Policy</Link>.
                    </p>
                    {errors.agreedToTerms && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-2 block">{errors.agreedToTerms}</span>}
                  </div>
                </div>
              </section>

              {/* Mobile CTA (Hidden on desktop) */}
              <div className="lg:hidden">
                <Button type="submit" variant="primary" className="w-full h-14 text-sm">
                  CONTINUE TO PAYMENT
                </Button>
              </div>

            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-5/12 xl:w-1/3">
            <div className="bg-brand-near-black border border-brand-charcoal p-6 lg:p-8 sticky top-24">
              <h2 className="font-syne text-xl font-bold uppercase tracking-wide mb-6">Order Review</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-brand-charcoal shrink-0 border border-brand-charcoal">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-syne font-bold uppercase text-xs truncate max-w-[150px]">{item.name}</h4>
                      <p className="font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/60 mt-1">Size: {item.size}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-outfit text-[10px] uppercase tracking-widest text-brand-off-white/60">Qty: {item.quantity}</span>
                        <span className="font-outfit text-xs font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-brand-charcoal pt-6 mb-6">
                <OrderSummary showPromo={false} onCheckout={true} />
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:block">
                <Button 
                  onClick={() => {
                    const form = document.getElementById('checkout-form') as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }} 
                  variant="primary" 
                  className="w-full h-14 text-sm"
                >
                  CONTINUE TO PAYMENT
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
