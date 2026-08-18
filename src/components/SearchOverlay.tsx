import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Product } from '../data/products';
import { ProductCard } from './ProductCard';

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && catalog.length === 0) {
      fetch('/api/public/products').then(r => r.ok ? r.json() : []).then(setCatalog).catch(console.error);
    }
  }, [isOpen, catalog.length]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      const filtered = catalog.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.collection.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-brand-near-black/95 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-12 py-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 max-w-2xl mx-auto relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-off-white/50" size={24} strokeWidth={1.5} />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH CATALOG..." 
              className="w-full bg-transparent border-b-2 border-brand-charcoal focus:border-brand-off-white outline-none pl-12 py-4 font-syne text-xl md:text-3xl uppercase transition-colors"
            />
          </div>
          <button onClick={onClose} className="p-4 text-brand-off-white hover:text-brand-off-white/60 transition-colors ml-4">
            <X size={32} strokeWidth={1} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 max-w-6xl mx-auto w-full">
          {query.trim().length > 1 && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.map(product => (
                <div key={product.id} onClick={onClose}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          {query.trim().length > 1 && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h3 className="font-syne text-2xl uppercase mb-4 text-brand-off-white">NO PIECES FOUND.</h3>
              <button onClick={onClose} className="font-outfit text-sm tracking-widest uppercase text-brand-off-white/60 hover:text-brand-off-white border-b border-brand-off-white/30 pb-1">
                RETURN TO SHOP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
