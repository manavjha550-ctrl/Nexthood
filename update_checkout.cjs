const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

// Replace the isPaymentStep logic to actually place the order
const mockPaymentLogic = `  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  if (isPaymentStep) {
    const handlePlaceOrder = async () => {
      setIsSubmitting(true);
      try {
        const payload = {
          id: orderRef,
          orderReference: orderRef,
          userId: user?.id,
          subtotal: 0, // calculate server side ideally, but for now we trust frontend structure then validate
          discount: 0,
          shipping: 0,
          tax: 0,
          total: items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
          items: items,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine: formData.address + (formData.address2 ? ', ' + formData.address2 : ''),
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: 'IN'
          },
          billingAddress: formData.useShippingForBilling ? {
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine: formData.address + (formData.address2 ? ', ' + formData.address2 : ''),
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: 'IN'
          } : {
            fullName: formData.billingFullName,
            phone: formData.billingPhone,
            addressLine: formData.billingAddress + (formData.billingAddress2 ? ', ' + formData.billingAddress2 : ''),
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

        if (res.ok) {
          clearCart();
          navigate('/account');
        } else {
          alert('Failed to place order');
        }
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
            <h3 className="font-syne text-lg font-bold uppercase mb-2">Simulated Checkout</h3>
            <p className="font-outfit text-sm text-brand-off-white/60 max-w-md mx-auto mb-6">
              PAYMENT GATEWAY WILL BE CONNECTED IN THE NEXT COMMERCE PHASE. CLICK BELOW TO PLACE THE ORDER.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setIsPaymentStep(false)} variant="outline" disabled={isSubmitting}>
                BACK
              </Button>
              <Button onClick={handlePlaceOrder} variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
`;

content = content.replace(/  if \(isPaymentStep\) \{[\s\S]*?    \);\n  \}/, mockPaymentLogic);

// Ensure useAuth is imported
if (!content.includes('useAuth')) {
  content = content.replace("import { useCart } from '../context/CartContext';", "import { useCart } from '../context/CartContext';\nimport { useAuth } from '../context/AuthContext';");
}

fs.writeFileSync('src/pages/Checkout.tsx', content);
