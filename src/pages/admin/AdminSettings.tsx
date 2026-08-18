import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    storeName: '',
    supportEmail: '',
    supportPhone: '',
    businessAddress: '',
    gstin: '',
    defaultShippingFee: 0,
    freeShippingThreshold: 0,
    codEnabled: false,
    announcementText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') parsedValue = Number(value);
    if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

    setSettings(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Store Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global configuration for your storefront.</p>
        </div>
        <button 
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-charcoal text-white hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input 
                  type="text" 
                  name="storeName"
                  value={settings.storeName || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input 
                  type="email" 
                  name="supportEmail"
                  value={settings.supportEmail || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                <input 
                  type="text" 
                  name="supportPhone"
                  value={settings.supportPhone || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <textarea 
                  name="businessAddress"
                  value={settings.businessAddress || ''} 
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Tax & Legal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input 
                  type="text" 
                  name="gstin"
                  value={settings.gstin || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Shipping & Payments</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Fee (₹)</label>
                <input 
                  type="number" 
                  name="defaultShippingFee"
                  value={settings.defaultShippingFee || 0} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
                <input 
                  type="number" 
                  name="freeShippingThreshold"
                  value={settings.freeShippingThreshold || 0} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="codEnabled"
                    checked={settings.codEnabled || false} 
                    onChange={handleChange}
                    className="w-4 h-4 text-charcoal border-gray-300 rounded focus:ring-charcoal"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Storefront</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marquee Announcement Bar</label>
                <input 
                  type="text" 
                  name="announcementText"
                  value={settings.announcementText || ''} 
                  onChange={handleChange}
                  placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹5000"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
