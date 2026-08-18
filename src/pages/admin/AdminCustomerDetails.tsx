import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, ShoppingBag, Eye } from 'lucide-react';
import type { AdminCustomerDetail } from '../../types/admin';

export default function AdminCustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then(res => res.json())
      .then(data => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8">Loading customer...</div>;
  if (!customer) return <div className="p-8">Customer not found.</div>;

  return (
    <div className="pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/customers')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-charcoal hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            {customer.fullName || 'Guest User'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <span className="text-charcoal">{customer.fullName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <span className="text-charcoal">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-charcoal">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-charcoal">Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Value</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-charcoal">{customer.orders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lifetime Spend</p>
                <p className="text-2xl font-bold text-charcoal">₹{customer.lifetimeSpend}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-display font-semibold text-lg text-charcoal">Order History</h2>
            </div>
            
            {customer.orderHistory && customer.orderHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Payment</th>
                      <th className="px-6 py-3 text-right">Total</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.orderHistory.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-charcoal">
                          <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                            #{order.id.slice(0,8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-charcoal">₹{order.total}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium text-charcoal mb-1">No orders yet</p>
                <p className="text-sm">This customer hasn't placed any orders.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
