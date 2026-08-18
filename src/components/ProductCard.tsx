import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../data/products';
import { AssetImage } from './ui';
import { useWishlist } from '../hooks/useWishlist';

export function ProductCard({ product }: { product: Product, key?: React.Key }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const hoverImg = product.images.length > 1 ? product.images[1].src : undefined;

  return (
    <div className="group flex flex-col h-full relative">
      <Link to={`/products/${product.slug}`} className="block relative mb-4 bg-brand-charcoal overflow-hidden w-full aspect-[3/4]">
        <AssetImage 
          src={product.primaryImage} 
          onHoverSrc={hoverImg}
          alt={product.name} 
          productName={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-20 pointer-events-none">
          {product.newArrival && (
            <span className="bg-brand-white text-brand-black text-[9px] font-bold tracking-widest px-2 py-1 uppercase">New</span>
          )}
          {product.bestseller && (
            <span className="bg-brand-white text-brand-black text-[9px] font-bold tracking-widest px-2 py-1 uppercase">Bestseller</span>
          )}
          {product.badges?.map(badge => (
            <span key={badge} className="bg-brand-white text-brand-black text-[9px] font-bold tracking-widest px-2 py-1 uppercase">{badge}</span>
          ))}
        </div>
      </Link>
      
      <button 
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 text-brand-off-white/50 hover:text-brand-white transition-colors z-20 p-2"
        aria-label="Toggle Wishlist"
      >
        <Heart size={18} strokeWidth={1.5} className={inWishlist ? "fill-brand-white text-brand-white" : ""} />
      </button>

      <Link to={`/products/${product.slug}`} className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1 gap-2">
          <p className="font-outfit text-[10px] md:text-[11px] text-brand-off-white/50 tracking-widest uppercase">{product.category}</p>
          <p className="font-outfit text-[10px] md:text-[11px] text-brand-off-white/50 tracking-widest uppercase text-right">{product.collection}</p>
        </div>
        <h4 className="font-syne font-semibold uppercase text-xs md:text-sm mb-1">{product.name}</h4>
        <div className="mt-auto pt-1 font-outfit text-[11px] md:text-sm font-medium flex items-center gap-2">
          <span>₹{product.price}</span>
          {product.compareAtPrice && (
            <span className="text-brand-off-white/40 line-through text-[10px] md:text-xs">₹{product.compareAtPrice}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
