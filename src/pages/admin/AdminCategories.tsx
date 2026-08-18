import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Archive, X, Save } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);

  const load = () => fetch('/api/admin/categories').then(r => r.json()).then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load().catch(console.error); }, []);

  const openCreate = () => { setEditing({ id: null }); setForm({ name: '', slug: '', description: '', status: 'ACTIVE' }); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', status: c.status || 'ACTIVE' }); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(editing?.id ? `/api/admin/categories/${editing.id}` : '/api/admin/categories', {
        method: editing?.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      setEditing(null); await load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Save failed'); } finally { setSaving(false); }
  };
  const archive = async (id: string) => {
    if (!confirm('Archive this category?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); await load();
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div>
    <div className="flex justify-between items-center mb-8">
      <div><h1 className="font-display text-2xl font-bold text-charcoal">Categories</h1><p className="text-gray-500 text-sm mt-1">Manage product categories.</p></div>
      <button onClick={openCreate} className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16}/>Add Category</button>
    </div>
    {editing && <form onSubmit={save} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 grid md:grid-cols-4 gap-3">
      <input required placeholder="Category name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="px-3 py-2 bg-gray-50 border rounded-lg text-sm"/>
      <input required placeholder="slug" value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} className="px-3 py-2 bg-gray-50 border rounded-lg text-sm"/>
      <input placeholder="description" value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="px-3 py-2 bg-gray-50 border rounded-lg text-sm"/>
      <div className="flex gap-2"><button disabled={saving} className="flex-1 bg-charcoal text-white rounded-lg"><Save size={15} className="inline mr-1"/>{saving?'Saving':'Save'}</button><button type="button" onClick={()=>setEditing(null)} className="px-3 border rounded-lg"><X size={15}/></button></div>
    </form>}
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b flex"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input placeholder="Search categories..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 border-b"><tr><th className="px-6 py-3">Category Name</th><th className="px-6 py-3">Slug</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
      <tbody className="divide-y">{loading?<tr><td colSpan={4} className="px-6 py-8 text-center">Loading...</td></tr>:filtered.map(c=><tr key={c.id}><td className="px-6 py-4 font-medium">{c.name}</td><td className="px-6 py-4 text-gray-500">{c.slug}</td><td className="px-6 py-4">{c.status}</td><td className="px-6 py-4 text-right"><button onClick={()=>openEdit(c)} className="p-2"><Edit2 size={16}/></button><button onClick={()=>archive(c.id)} className="p-2 text-red-500"><Archive size={16}/></button></td></tr>)}</tbody></table></div>
    </div>
  </div>;
}
