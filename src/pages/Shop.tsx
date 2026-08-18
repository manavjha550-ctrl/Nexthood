import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function Shop() {
  const { slug } = useParams<{ slug?: string }>();
  
  // Pre-filter based on route
  const isGraphicSeries = slug === 'graphic-series';
  const isTShirts = slug === 't-shirts';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/public/products')
      .then(r => { if (!r.ok) throw new Error('Failed to load products'); return r.json(); })
      .then(data => { if (active) setProducts(data); })
      .catch(err => console.error(err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(isTShirts ? ['T-Shirts'] : []);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(isGraphicSeries ? ['Graphic Series'] : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Featured');

  const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCollections([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange('All');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedCollections.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange !== 'All';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    if (selectedCollections.length > 0) {
      result = result.filter(p => selectedCollections.includes(p.collection));
    }
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    }
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    }
    if (priceRange !== 'All') {
      result = result.filter(p => {
        if (priceRange === 'Under ₹400') return p.price < 400;
        if (priceRange === '₹400–₹499') return p.price >= 400 && p.price <= 499;
        if (priceRange === '₹500+') return p.price >= 500;
        return true;
      });
    }

    // Sort
    switch (sortBy) {
      case 'Newest Arrivals':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Alphabetical: A–Z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Alphabetical: Z–A':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Featured':
      default:
        // Keep catalog order
        break;
    }

    return result;
  }, [products, selectedCategories, selectedCollections, selectedSizes, selectedColors, priceRange, sortBy]);

  const filterOptions = useMemo(() => ({
    categories: [...new Set(products.map(p => p.category).filter(Boolean))],
    collections: [...new Set(products.map(p => p.collection).filter(Boolean))],
    sizes: [...new Set(products.flatMap(p => p.sizes || []))],
    colors: [...new Set(products.flatMap(p => p.colors || []))]
  }), [products]);

  const FilterSidebar = () => (
    <div className="flex flex-col gap-8 pr-8">
      <div>
        <h4 className="font-syne font-bold uppercase mb-4 border-b border-brand-charcoal pb-2">Category</h4>
        <div className="flex flex-col gap-2">
          {filterOptions.categories.map(cat => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${selectedCategories.includes(cat) ? 'border-brand-off-white bg-brand-off-white' : 'border-brand-dark-gray group-hover:border-brand-off-white/50'}`}>
                {selectedCategories.includes(cat) && <X size={12} className="text-brand-black" strokeWidth={3} />}
              </div>
              <span className="font-outfit text-sm uppercase tracking-widest text-brand-off-white/80 group-hover:text-brand-off-white transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-syne font-bold uppercase mb-4 border-b border-brand-charcoal pb-2">Collection</h4>
        <div className="flex flex-col gap-2">
          {filterOptions.collections.map(col => (
            <label key={col} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${selectedCollections.includes(col) ? 'border-brand-off-white bg-brand-off-white' : 'border-brand-dark-gray group-hover:border-brand-off-white/50'}`}>
                {selectedCollections.includes(col) && <X size={12} className="text-brand-black" strokeWidth={3} />}
              </div>
              <span className="font-outfit text-sm uppercase tracking-widest text-brand-off-white/80 group-hover:text-brand-off-white transition-colors">{col}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-syne font-bold uppercase mb-4 border-b border-brand-charcoal pb-2">Size</h4>
        <div className="flex flex-wrap gap-2">
          {filterOptions.sizes.map(size => (
            <button
              key={size}
              onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
              className={`font-outfit text-xs px-3 py-2 border transition-colors ${selectedSizes.includes(size) ? 'border-brand-off-white bg-brand-off-white text-brand-black font-bold' : 'border-brand-dark-gray text-brand-off-white/80 hover:border-brand-off-white'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-syne font-bold uppercase mb-4 border-b border-brand-charcoal pb-2">Colorway</h4>
        <div className="flex flex-col gap-2">
          {filterOptions.colors.map(color => (
            <label key={color} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 border transition-colors flex items-center justify-center ${selectedColors.includes(color) ? 'border-brand-off-white bg-brand-off-white' : 'border-brand-dark-gray group-hover:border-brand-off-white/50'}`}>
                {selectedColors.includes(color) && <X size={12} className="text-brand-black" strokeWidth={3} />}
              </div>
              <span className="font-outfit text-sm uppercase tracking-widest text-brand-off-white/80 group-hover:text-brand-off-white transition-colors">{color}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-syne font-bold uppercase mb-4 border-b border-brand-charcoal pb-2">Price</h4>
        <div className="flex flex-col gap-2">
          {['All', 'Under ₹400', '₹400–₹499', '₹500+'].map(price => (
            <label key={price} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="price" 
                className="hidden" 
                checked={priceRange === price} 
                onChange={() => setPriceRange(price)}
              />
              <div className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${priceRange === price ? 'border-brand-off-white' : 'border-brand-dark-gray group-hover:border-brand-off-white/50'}`}>
                {priceRange === price && <div className="w-2 h-2 rounded-full bg-brand-off-white" />}
              </div>
              <span className="font-outfit text-sm uppercase tracking-widest text-brand-off-white/80 group-hover:text-brand-off-white transition-colors">{price}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-24">
      {/* HEADER SECTION */}
      <div className="container mx-auto px-6 lg:px-12 mb-12">
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-wide mb-2">
          {slug ? slug.replace('-', ' ') : 'SHOP'}
        </h1>
        <p className="font-outfit text-xs md:text-sm tracking-widest text-brand-off-white/60 uppercase">
          PRECISION-CUT URBAN GARMENTS.
        </p>
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        {/* ACTIVE FILTERS & SORT MOBILE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-brand-charcoal pb-4">
          <div className="flex items-center flex-wrap gap-2 flex-1">
            <button 
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 font-outfit text-xs tracking-widest uppercase border border-brand-dark-gray px-4 py-2 hover:bg-brand-charcoal transition-colors"
            >
              <Filter size={14} /> Filter & Sort
            </button>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="font-outfit text-xs tracking-widest uppercase text-brand-off-white/50 hover:text-brand-off-white ml-2 transition-colors underline underline-offset-4">
                Clear All
              </button>
            )}
            
            <div className="hidden md:flex flex-wrap gap-2 items-center">
              {[...selectedCategories, ...selectedCollections, ...selectedSizes, ...selectedColors].map(f => (
                <span key={f} className="flex items-center gap-1 font-outfit text-[10px] tracking-widest uppercase bg-brand-charcoal px-3 py-1">
                  {f}
                  <X size={12} className="cursor-pointer hover:text-brand-off-white/50 ml-1" onClick={() => {
                    if (selectedCategories.includes(f)) toggleFilter(selectedCategories, setSelectedCategories, f);
                    if (selectedCollections.includes(f)) toggleFilter(selectedCollections, setSelectedCollections, f);
                    if (selectedSizes.includes(f)) toggleFilter(selectedSizes, setSelectedSizes, f);
                    if (selectedColors.includes(f)) toggleFilter(selectedColors, setSelectedColors, f);
                  }} />
                </span>
              ))}
              {priceRange !== 'All' && (
                <span className="flex items-center gap-1 font-outfit text-[10px] tracking-widest uppercase bg-brand-charcoal px-3 py-1">
                  {priceRange}
                  <X size={12} className="cursor-pointer hover:text-brand-off-white/50 ml-1" onClick={() => setPriceRange('All')} />
                </span>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <span className="font-outfit text-xs tracking-widest uppercase text-brand-off-white/50">Sort By</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-brand-dark-gray text-brand-off-white font-outfit text-xs tracking-widest uppercase px-4 py-2 outline-none focus:border-brand-off-white transition-colors cursor-pointer"
            >
              <option value="Featured">Featured</option>
              <option value="Newest Arrivals">Newest Arrivals</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Alphabetical: A–Z">Alphabetical: A–Z</option>
              <option value="Alphabetical: Z–A">Alphabetical: Z–A</option>
            </select>
          </div>
        </div>

        {loading && <div className="py-16 text-center font-outfit text-xs uppercase tracking-widest text-brand-off-white/50">Loading collection...</div>}
        {!loading && filteredProducts.length === 0 && <div className="py-16 text-center font-outfit text-xs uppercase tracking-widest text-brand-off-white/50">No products match your selection.</div>}
        <div className="flex gap-12">
          {/* DESKTOP SIDEBAR */}
          <div className="hidden md:block w-64 flex-shrink-0 sticky top-24 self-start">
            <FilterSidebar />
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-brand-charcoal">
                <p className="font-syne text-xl uppercase mb-2">No pieces found.</p>
                <p className="font-outfit text-xs tracking-widest uppercase text-brand-off-white/50 mb-6">Try adjusting your filters.</p>
                <button onClick={clearFilters} className="font-outfit text-xs font-bold tracking-widest uppercase text-brand-black bg-brand-off-white px-6 py-3 hover:bg-brand-white transition-colors">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-brand-near-black border-l border-brand-charcoal z-50 flex flex-col md:hidden overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-brand-charcoal">
                <h3 className="font-syne text-lg font-bold uppercase">Filter & Sort</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-brand-off-white/60 hover:text-brand-off-white">
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8">
                  <h4 className="font-syne font-bold uppercase mb-4 border-b border-brand-charcoal pb-2">Sort By</h4>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-transparent border border-brand-dark-gray text-brand-off-white font-outfit text-sm tracking-widest uppercase px-4 py-3 outline-none focus:border-brand-off-white transition-colors"
                  >
                    <option value="Featured">Featured</option>
                    <option value="Newest Arrivals">Newest Arrivals</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Alphabetical: A–Z">Alphabetical: A–Z</option>
                    <option value="Alphabetical: Z–A">Alphabetical: Z–A</option>
                  </select>
                </div>
                <FilterSidebar />
              </div>
              <div className="p-6 border-t border-brand-charcoal bg-brand-near-black flex gap-4">
                <button onClick={clearFilters} className="flex-1 font-outfit text-xs font-bold tracking-widest uppercase text-brand-off-white border border-brand-dark-gray py-4 hover:border-brand-off-white transition-colors">
                  Clear
                </button>
                <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 font-outfit text-xs font-bold tracking-widest uppercase text-brand-black bg-brand-off-white py-4 hover:bg-brand-white transition-colors">
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
