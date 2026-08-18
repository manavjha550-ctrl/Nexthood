import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import type { AdminOrderDetail } from '../../types/admin';

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setStatus(data.orderStatus);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      alert('Order status updated');
    } catch(e) {
      alert('Failed to update status');
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-8">Loading order...</div>;
  if (!order) return <div className="p-8">Order not found.</div>;

  return (
    <div className="pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-charcoal hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Order #{order.id.slice(0,8).toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto flex gap-3 items-center">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button 
            onClick={handleUpdateStatus}
            disabled={updating || status === order.orderStatus}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-charcoal text-white hover:bg-black transition-colors disabled:opacity-50"
          >
            {updating ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' | '}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right font-medium text-charcoal">
                    ₹{Number(item.unitPrice) * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Discount</span>
                <span>-₹{Number(order.discount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>₹{Number(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-medium text-charcoal text-lg mt-2 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{Number(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Customer</h2>
            <div className="space-y-1">
              <p className="font-medium text-charcoal">{order.shippingAddress?.fullName}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Shipping Address</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{order.shippingAddress?.addressLine}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Payment</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method:</span>
                <span className="font-medium">Not configured</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
