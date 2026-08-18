import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../data/products';
import { Button, AssetImage } from '../components/ui';
import { ArrowLeft, ArrowRight, Heart, X, ChevronDown, Share2, Minus, Plus } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { ProductCard } from '../components/ProductCard';
import { AnimatePresence, motion } from 'motion/react';

// --- SUB-COMPONENTS ---

function Gallery({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.slug]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Lightbox keyboard controls
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveIndex((prev) => (prev + 1) % product.images.length);
      if (e.key === 'ArrowLeft') setActiveIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, product.images.length]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Image */}
      <div 
        className="relative bg-brand-charcoal cursor-zoom-in group overflow-hidden w-full aspect-[3/4] md:aspect-auto md:h-[85vh]"
        onClick={() => setLightboxOpen(true)}
      >
        <AssetImage 
          src={product.images[activeIndex]?.src || product.primaryImage} 
          alt={product.images[activeIndex]?.alt || product.name} 
          productName={product.name}
          className="w-full h-full object-cover" 
        />
        
        {/* Gallery Controls (Desktop overlay, hidden if only 1 image) */}
        {product.images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <button onClick={handlePrev} className="pointer-events-auto w-10 h-10 bg-brand-black/50 text-brand-white flex items-center justify-center hover:bg-brand-black transition-colors rounded-full">
              <ArrowLeft size={16} />
            </button>
            <button onClick={handleNext} className="pointer-events-auto w-10 h-10 bg-brand-black/50 text-brand-white flex items-center justify-center hover:bg-brand-black transition-colors rounded-full">
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {product.images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {product.images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 snap-center w-20 md:w-24 aspect-[3/4] overflow-hidden transition-all ${i === activeIndex ? 'border-2 border-brand-off-white opacity-100' : 'border-2 border-transparent opacity-50 hover:opacity-100'}`}
            >
              <AssetImage src={img.src} alt={img.alt} productName={product.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="absolute top-6 right-6 z-10">
              <button onClick={() => setLightboxOpen(false)} className="text-brand-off-white hover:text-brand-white p-2">
                <X size={32} strokeWidth={1} />
              </button>
            </div>
            
            <div className="relative w-full max-w-7xl h-full p-6 md:p-12 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <AssetImage 
                src={product.images[activeIndex]?.src || product.primaryImage} 
                alt={product.images[activeIndex]?.alt || product.name} 
                productName={product.name}
                className="max-w-full max-h-full object-contain" 
              />
              
              {product.images.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-near-black text-brand-white flex items-center justify-center hover:bg-brand-charcoal transition-colors rounded-full border border-brand-charcoal">
                    <ArrowLeft size={20} />
                  </button>
                  <button onClick={handleNext} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-near-black text-brand-white flex items-center justify-center hover:bg-brand-charcoal transition-colors rounded-full border border-brand-charcoal">
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SizeGuideModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [unit, setUnit] = useState<'CM' | 'IN'>('CM');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-near-black border border-brand-charcoal p-8 w-full max-w-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-brand-off-white/60 hover:text-brand-white">
          <X size={24} />
        </button>
        <h3 className="font-syne text-2xl font-bold uppercase mb-6">Size Guide</h3>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setUnit('CM')} 
            className={`font-outfit text-xs tracking-widest uppercase pb-1 border-b-2 ${unit === 'CM' ? 'border-brand-white text-brand-white font-bold' : 'border-transparent text-brand-off-white/50 hover:text-brand-off-white'}`}
          >
            CM
          </button>
          <button 
            onClick={() => setUnit('IN')} 
            className={`font-outfit text-xs tracking-widest uppercase pb-1 border-b-2 ${unit === 'IN' ? 'border-brand-white text-brand-white font-bold' : 'border-transparent text-brand-off-white/50 hover:text-brand-off-white'}`}
          >
            IN
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-outfit text-sm text-left">
            <thead>
              <tr className="border-b border-brand-charcoal text-brand-off-white/50 tracking-widest uppercase">
                <th className="py-4 font-normal">Size</th>
                <th className="py-4 font-normal">Chest</th>
                <th className="py-4 font-normal">Shoulder</th>
                <th className="py-4 font-normal">Length</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: 'S', cm: [56, 52, 70], in: [22, 20.5, 27.5] },
                { s: 'M', cm: [58, 54, 72], in: [22.8, 21.3, 28.3] },
                { s: 'L', cm: [60, 56, 74], in: [23.6, 22, 29.1] },
                { s: 'XL', cm: [62, 58, 76], in: [24.4, 22.8, 30] },
                { s: 'XXL', cm: [64, 60, 78], in: [25.2, 23.6, 30.7] }
              ].map(row => (
                <tr key={row.s} className="border-b border-brand-charcoal/50 text-brand-off-white">
                  <td className="py-4 font-bold">{row.s}</td>
                  <td className="py-4">{unit === 'CM' ? row.cm[0] : row.in[0]}</td>
                  <td className="py-4">{unit === 'CM' ? row.cm[1] : row.in[1]}</td>
                  <td className="py-4">{unit === 'CM' ? row.cm[2] : row.in[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-outfit text-[11px] tracking-widest uppercase text-brand-off-white/50 mt-6">
          Measurements are approximate. Garments are engineered for an oversized fit.
        </p>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-brand-charcoal">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center py-5 hover:text-brand-off-white/80 transition-colors"
      >
        <span className="font-syne text-sm font-bold uppercase tracking-wide">{title}</span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-5 font-outfit text-sm text-brand-off-white/70 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN PAGE ---

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    setProductLoading(true);
    Promise.all([
      fetch(`/api/public/products/${slug}`).then(r => { if (!r.ok) throw new Error('Product not found'); return r.json(); }),
      fetch('/api/public/products').then(r => r.ok ? r.json() : [])
    ])
      .then(([data, products]) => {
        if (!active) return;
        setProduct(data);
        setAllProducts(products);
      })
      .catch(() => { if (active) setProduct(null); })
      .finally(() => { if (active) setProductLoading(false); });
    return () => { active = false; };
  }, [slug]);

  const recentIds = useRecentlyViewed(product?.id);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem, openDrawer } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  
  const purchaseControlsRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // SEO & Resets
  useEffect(() => {
    if (product) {
      document.title = `${product.name.toUpperCase()} — NEXTHOOD STUDIO`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', product.description || `Buy ${product.name} from Nexthood Studio.`);
      }
      // Reset state for new product
      setSelectedSize(null);
      setSizeError(false);
      setQuantity(1);
      setPincode('');
      setPincodeStatus(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [product]);

  // Sticky Bar Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when purchase controls are OUT of view above the screen
        setShowStickyBar(entry.boundingClientRect.top < 0 && !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    if (purchaseControlsRef.current) observer.observe(purchaseControlsRef.current);
    return () => observer.disconnect();
  }, [product]);

  if (productLoading) {
    return <div className="min-h-screen pt-32 px-6 text-center font-outfit text-xs uppercase tracking-widest text-brand-off-white/50">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase mb-4">PRODUCT NOT FOUND</h1>
        <p className="font-outfit text-sm tracking-widest text-brand-off-white/60 uppercase mb-8">The requested piece could not be located.</p>
        <Link to="/shop"><Button variant="primary">Return to Shop</Button></Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const stock = product.stock ?? 10; // Default to available if undefined for testing
  const isSoldOut = stock === 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - NEXTHOOD STUDIO`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share error', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > stock) return stock;
      return next;
    });
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      setPincodeStatus('CHECKING...');
      setTimeout(() => setPincodeStatus(`DELIVERY AVAILABLE TO ${pincode}`), 800);
    } else {
      setPincodeStatus('PLEASE ENTER A VALID 6-DIGIT PINCODE');
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    
    addItem({
      id: `${product.id}-${selectedSize || 'none'}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      size: selectedSize || '',
      image: product.primaryImage,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity,
      stock: product.stock ?? 10
    });
    
    // Add brief visual feedback
    const btn = document.activeElement as HTMLButtonElement;
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = 'ADDED TO BAG';
      setTimeout(() => {
        if (btn) btn.innerText = originalText;
      }, 2000);
    }
    
    openDrawer();
  };

  // Recommendations
  

  const recentlyViewedProducts = recentIds
    .filter(id => id !== product.id)
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined)
    .slice(0, 4);

  const recommendations = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 lg:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 font-outfit text-[10px] md:text-xs tracking-widest uppercase text-brand-off-white/50">
          <Link to="/" className="hover:text-brand-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-white transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/collections/${product.collection.toLowerCase().replace(/ /g, '-')}`} className="hover:text-brand-white transition-colors">
            {product.collection}
          </Link>
          <span>/</span>
          <span className="text-brand-white truncate">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* LEFT: GALLERY (7 Columns on large screens) */}
          <div className="w-full lg:w-7/12">
            <Gallery product={product} />
          </div>

          {/* RIGHT: INFO (5 Columns on large screens) */}
          <div className="w-full lg:w-5/12 lg:sticky lg:top-24 self-start pb-12">
            
            <div className="flex justify-between items-start mb-2">
              <p className="font-outfit text-xs tracking-widest text-brand-off-white/60 uppercase">
                {product.collection} / {product.category}
              </p>
              <div className="flex gap-4 text-brand-off-white/60">
                <button onClick={handleShare} className="hover:text-brand-white transition-colors p-1" aria-label="Share">
                  <Share2 size={18} strokeWidth={1.5} />
                </button>
                <button onClick={() => toggleWishlist(product.id)} className="hover:text-brand-white transition-colors p-1" aria-label="Wishlist">
                  <Heart size={18} strokeWidth={1.5} className={inWishlist ? 'fill-brand-white text-brand-white' : ''} />
                </button>
              </div>
            </div>

            <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-wide mb-4 leading-none">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-outfit text-xl font-medium">₹{product.price}</span>
              {product.compareAtPrice && (
                <span className="font-outfit text-base text-brand-off-white/40 line-through">₹{product.compareAtPrice}</span>
              )}
            </div>

            {/* Badges / Stock */}
            <div className="flex flex-wrap gap-2 mb-8 pointer-events-none">
              {product.badges?.map(badge => (
                <span key={badge} className="bg-brand-white text-brand-black font-outfit text-[10px] font-bold tracking-widest px-2 py-1 uppercase">{badge}</span>
              ))}
              {isSoldOut ? (
                <span className="bg-red-900/50 text-red-100 font-outfit text-[10px] font-bold tracking-widest px-2 py-1 uppercase border border-red-500/50">Sold Out</span>
              ) : stock <= 5 ? (
                <span className="bg-orange-900/50 text-orange-100 font-outfit text-[10px] font-bold tracking-widest px-2 py-1 uppercase border border-orange-500/50">Low Stock</span>
              ) : (
                <span className="border border-brand-dark-gray text-brand-off-white/80 font-outfit text-[10px] font-bold tracking-widest px-2 py-1 uppercase">In Stock</span>
              )}
            </div>

            {product.description && (
              <p className="font-outfit text-sm text-brand-off-white/70 mb-10 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* SIZES */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-syne text-sm font-bold uppercase">Size</span>
                    {sizeError && <span className="font-outfit text-xs font-bold text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5">Select a size</span>}
                  </div>
                  <button onClick={() => setSizeGuideOpen(true)} className="font-outfit text-xs tracking-widest uppercase text-brand-off-white/50 hover:text-brand-white underline underline-offset-4">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      disabled={isSoldOut}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`h-12 font-outfit text-sm font-medium transition-colors border ${
                        selectedSize === size 
                          ? 'border-brand-white bg-brand-white text-brand-black' 
                          : 'border-brand-charcoal text-brand-off-white hover:border-brand-off-white/50 bg-brand-near-black disabled:opacity-30 disabled:hover:border-brand-charcoal'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PURCHASE CONTROLS */}
            <div ref={purchaseControlsRef} className="flex flex-col gap-4 mb-10">
              <div className="flex gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-brand-charcoal h-14 bg-brand-near-black w-32 shrink-0">
                  <button onClick={() => handleQuantityChange(-1)} disabled={isSoldOut} className="w-10 h-full flex items-center justify-center text-brand-off-white/60 hover:text-brand-white disabled:opacity-30"><Minus size={16} /></button>
                  <span className="flex-1 text-center font-outfit text-sm font-bold">{isSoldOut ? 0 : quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={isSoldOut} className="w-10 h-full flex items-center justify-center text-brand-off-white/60 hover:text-brand-white disabled:opacity-30"><Plus size={16} /></button>
                </div>
                
                {/* Add To Bag */}
                <Button 
                  variant="primary" 
                  className="flex-1 h-14 text-sm" 
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                >
                  {isSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
                </Button>
              </div>
              <Button variant="outline" className="w-full h-14 text-sm" disabled={isSoldOut} onClick={() => handleAddToCart()}>
                BUY IT NOW
              </Button>
            </div>

            {/* PINCODE */}
            <div className="bg-brand-charcoal/30 p-5 border border-brand-charcoal mb-10">
              <h4 className="font-syne text-xs font-bold uppercase tracking-wider mb-4">Check Delivery</h4>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="ENTER 6-DIGIT PINCODE"
                  className="flex-1 bg-transparent border-b border-brand-dark-gray font-outfit text-xs tracking-widest uppercase outline-none focus:border-brand-off-white px-2 py-2"
                />
                <button type="submit" disabled={pincode.length !== 6} className="font-outfit text-[10px] font-bold tracking-widest uppercase bg-brand-white text-brand-black px-4 disabled:opacity-50">
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className={`mt-3 font-outfit text-[10px] font-bold tracking-widest uppercase ${pincodeStatus.includes('AVAILABLE') ? 'text-green-400' : 'text-brand-off-white/60'}`}>
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* ACCORDIONS */}
            <div className="border-t border-brand-charcoal pt-2">
              <Accordion title="Details & Specifications">
                <ul className="list-disc pl-4 space-y-1 marker:text-brand-off-white/30">
                  <li>Premium heavyweight cotton construction</li>
                  <li>Boxy, slightly oversized modern silhouette</li>
                  <li>Dropped shoulders for relaxed drape</li>
                  <li>High-density precision print</li>
                  <li>Signature Nexthood Studio woven label</li>
                  <li>SKU: {product.sku}</li>
                </ul>
              </Accordion>
              <Accordion title="Fit & Silhouette">
                Engineered for an oversized, structured fit. We recommend taking your standard size for the intended boxy aesthetic, or sizing down if you prefer a traditional fit. The heavyweight fabric holds its shape away from the body.
              </Accordion>
              <Accordion title="Shipping & Dispatch">
                Standard orders are dispatched within 24-48 business hours. Delivery typically takes 3-5 business days depending on location. Express shipping options available at checkout.
              </Accordion>
              <Accordion title="Returns & Exchanges">
                We accept returns and exchanges within 7 days of delivery. Garments must be unworn, unwashed, and in original condition with tags attached. Please note that sale items are final sale.
              </Accordion>
              <Accordion title="Garment Care">
                Machine wash cold with like colors. Wash inside out to preserve prints. Do not bleach. Tumble dry low or hang dry for best results. Do not iron directly on graphics.
              </Accordion>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        {recommendations.length > 0 && (
          <div className="mt-24 md:mt-32 pt-16 border-t border-brand-charcoal">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-syne text-2xl font-bold uppercase tracking-wide">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recommendations.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-16 md:mt-24 pt-16 border-t border-brand-charcoal">
            <h2 className="font-syne text-2xl font-bold uppercase tracking-wide mb-8">Recently Viewed</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recentlyViewedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY PURCHASE BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full z-40 lg:hidden bg-brand-near-black/95 backdrop-blur-md border-t border-brand-charcoal px-4 py-3 pb-safe"
          >
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
              <div className="flex flex-col">
                <span className="font-syne font-bold uppercase text-xs truncate max-w-[120px]">{product.name}</span>
                <span className="font-outfit text-sm">₹{product.price}</span>
              </div>
              <Button 
                variant="primary" 
                className="flex-1 h-12 py-0 text-xs" 
                disabled={isSoldOut}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (!selectedSize) setSizeError(true);
                  else handleAddToCart();
                }}
              >
                {isSoldOut ? 'SOLD OUT' : 'ADD TO BAG'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
