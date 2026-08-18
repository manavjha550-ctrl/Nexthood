import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, IndianRupee, ShoppingBag } from 'lucide-react';
import type { AdminMetrics } from '../../types/admin';

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  if (!metrics || metrics.totalOrders === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Analytics</h1>
          <p className="text-gray-500 mt-1">Store performance and insights.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-charcoal mb-1">Not Enough Data</p>
          <p className="text-sm">Once you start getting orders, insights will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal">Analytics</h1>
          <p className="text-gray-500 mt-1">Store performance and insights.</p>
        </div>
        <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20">
          <option>All Time</option>
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-charcoal">{formatCurrency(metrics.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-charcoal">{metrics.totalOrders}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Order Value</p>
              <h3 className="text-3xl font-bold text-charcoal">{formatCurrency(metrics.avgOrderValue)}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-charcoal">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex items-center justify-center text-gray-500">
         <div className="text-center">
            <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm font-medium">Chart visualization will appear as more data arrives.</p>
         </div>
      </div>
    </div>
  );
}
