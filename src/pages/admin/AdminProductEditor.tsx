import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import { Product } from '../../data/products';

export default function AdminProductEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    category: '',
    collection: '',
    sku: '',
    price: 0,
    compareAtPrice: 0,
    stock: 0,
    status: 'ACTIVE',
    featured: false,
    newArrival: false,
    bestseller: false,
    primaryImage: '',
    images: []
  });

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') parsedValue = Number(value);
    if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        navigate('/admin/products');
      } else {
        alert('Failed to save product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading editor...</div>;

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button 
          type="button" 
          onClick={() => navigate('/admin/products')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-charcoal hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h1>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-charcoal text-white hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <h2 className="font-display font-semibold text-lg text-charcoal">General Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name || ''} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input 
                    type="text" 
                    name="slug"
                    value={formData.slug || ''} 
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input 
                    type="text" 
                    name="sku"
                    value={formData.sku || ''} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  value={formData.description || ''} 
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <h2 className="font-display font-semibold text-lg text-charcoal">Media</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
              <ImageIcon size={32} className="mb-2 text-gray-400" />
              <p className="text-sm font-medium">Click to upload images</p>
              <p className="text-xs mt-1">JPEG, PNG up to 5MB</p>
            </div>
            {formData.primaryImage && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <img src={formData.primaryImage} alt="Primary" className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <h2 className="font-display font-semibold text-lg text-charcoal">Status & Organization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status"
                  value={formData.status || 'ACTIVE'} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  name="category"
                  value={formData.category || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
                <input 
                  type="text" 
                  name="collection"
                  value={formData.collection || ''} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <h2 className="font-display font-semibold text-lg text-charcoal">Pricing & Inventory</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price || 0} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compare at (₹)</label>
                  <input 
                    type="number" 
                    name="compareAtPrice"
                    value={formData.compareAtPrice || 0} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input 
                  type="number" 
                  name="stock"
                  value={formData.stock || 0} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <h2 className="font-display font-semibold text-lg text-charcoal">Merchandising</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="featured"
                  checked={formData.featured || false} 
                  onChange={handleChange}
                  className="w-4 h-4 text-charcoal border-gray-300 rounded focus:ring-charcoal"
                />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="newArrival"
                  checked={formData.newArrival || false} 
                  onChange={handleChange}
                  className="w-4 h-4 text-charcoal border-gray-300 rounded focus:ring-charcoal"
                />
                <span className="text-sm font-medium text-gray-700">New Arrival</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="bestseller"
                  checked={formData.bestseller || false} 
                  onChange={handleChange}
                  className="w-4 h-4 text-charcoal border-gray-300 rounded focus:ring-charcoal"
                />
                <span className="text-sm font-medium text-gray-700">Bestseller</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
