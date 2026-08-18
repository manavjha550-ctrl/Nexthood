import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Users, Package, ArrowRight } from 'lucide-react';
import type { AdminMetrics } from '../../types/admin';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
      </div>
    </div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-charcoal">Overview</h1>
        <p className="text-gray-500 mt-1">Store performance and recent activity.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-charcoal">{formatCurrency(metrics.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <IndianRupee size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-charcoal">{metrics.totalOrders}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Customers</p>
              <h3 className="text-2xl font-bold text-charcoal">{metrics.customersCount}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Products</p>
              <h3 className="text-2xl font-bold text-charcoal">{metrics.activeProducts}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <Package size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-charcoal font-display">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-gray-500 hover:text-charcoal flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        
        {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-charcoal">
                      <Link to={`/admin/orders/${order.id}`}>#{order.id.slice(0,8).toUpperCase()}</Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-charcoal">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium text-charcoal mb-1">No sales data yet</p>
            <p className="text-sm">When customers place orders, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
