import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button, AssetImage } from '../components/ui';

import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';

export function Home() {
  
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 4));
      });
  }, []);


  return (
    <div className="w-full">
      {/* 2. LARGE HERO */}
      <section className="relative w-full h-[85vh] min-h-[500px] bg-brand-charcoal overflow-hidden group">
        <AssetImage 
          src="/images/ui/hero.jpg" 
          alt="Nexthood Studio Campaign"
          productName="Hero Campaign"
          className="absolute inset-0 w-full h-full" 
        />
        {/* Subtle gradient to ensure text readability if overlaid */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/80 via-transparent to-transparent sm:w-2/3"></div>
        
        <div className="absolute inset-0 container mx-auto px-6 lg:px-12 flex flex-col justify-end pb-16 md:pb-24 z-20">
          <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-wide text-brand-white mb-2">
            NEXTHOOD STUDIO
          </h1>
          <p className="font-outfit text-sm md:text-base tracking-widest text-brand-off-white/80 uppercase mb-8 max-w-lg">
            BUILT FOR THE NEXT.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop"><Button variant="primary" className="w-full sm:w-auto">Shop Now</Button></Link>
            <Link to="/collections"><Button variant="outline" className="w-full sm:w-auto">Explore Collection</Button></Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED / NEW DROP */}
      <section className="py-16 md:py-24 border-b border-brand-charcoal">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <h2 className="font-syne text-2xl md:text-3xl font-bold uppercase mb-4">Mainline / Drop 01</h2>
            <p className="font-outfit text-sm tracking-widest uppercase text-brand-off-white/60 mb-8 max-w-md leading-relaxed">
              Heavyweight cotton. Engineered for structure and endurance. A modern uniform.
            </p>
            <Link to="/collections/graphic-series"><Button variant="outline" className="w-fit">Shop The Drop</Button></Link>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <AssetImage 
              src="/images/products/blessed_model.jpg" 
              alt="Blessed Model"
              productName="Blessed Model View"
              aspectRatio="4/3" 
              className="w-full" 
            />
          </div>
        </div>
      </section>

      {/* 4. SHOP CATEGORIES */}
      <section className="py-16 md:py-24 border-b border-brand-charcoal">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-syne text-xl md:text-2xl font-bold uppercase">Shop Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Graphic Tees", src: "/images/ui/cat_graphic.jpg", link: "/shop" },
              { name: "Heavyweight Basics", src: "/images/ui/cat_heavy.jpg", link: "/shop" },
              { name: "Vintage Wash", src: "/images/ui/cat_vintage.jpg", link: "/shop" },
              { name: "Core Classics", src: "/images/ui/cat_core.jpg", link: "/shop" }
            ].map((cat, i) => (
              <Link to={cat.link} key={i} className="group block cursor-pointer">
                <AssetImage 
                  src={cat.src} 
                  alt={cat.name} 
                  productName={`Category: ${cat.name}`}
                  aspectRatio="3/4" 
                  className="w-full mb-4" 
                />
                <h3 className="font-outfit text-xs md:text-sm tracking-widest uppercase text-brand-off-white group-hover:text-brand-off-white/70 transition-colors text-center">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS */}
      <section className="py-16 md:py-24 border-b border-brand-charcoal">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-syne text-xl md:text-2xl font-bold uppercase">Featured Products</h2>
            <Link to="/shop" className="font-outfit text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors flex items-center gap-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. BRAND STATEMENT */}
      <section className="py-24 md:py-32 border-b border-brand-charcoal">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-syne text-2xl md:text-4xl font-bold uppercase tracking-wide mb-6">
            BUILT FOR THE NEXT.
          </h2>
          <p className="font-outfit text-xs md:text-sm tracking-widest uppercase text-brand-off-white/60 max-w-xl mx-auto leading-relaxed">
            NEXTHOOD STUDIO BUILDS CONTEMPORARY GARMENTS FOR A CULTURE THAT DOESN'T STAND STILL.
          </p>
        </div>
      </section>

      {/* 7. EDITORIAL CAMPAIGN */}
      <section className="py-16 md:py-24 border-b border-brand-charcoal">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <AssetImage src="/images/ui/campaign_main.jpg" alt="Editorial Main" productName="Editorial Campaign" aspectRatio="16/9" className="w-full h-full min-h-[300px]" />
            </div>
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              <AssetImage src="/images/ui/campaign_detail.jpg" alt="Editorial Detail" productName="Editorial Detail" aspectRatio="4/3" className="w-full h-[calc(50%-12px)]" />
              <div className="flex-1 bg-brand-charcoal flex flex-col items-center justify-center p-8 border border-brand-dark-gray h-[calc(50%-12px)]"> 
                <h3 className="font-syne text-lg font-bold uppercase mb-4 text-center">Campaign 01</h3>
                <Link to="/collections"><Button variant="outline" className="scale-90">View Lookbook</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER */}
      <section className="py-20 md:py-24 border-b border-brand-charcoal">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
          <h2 className="font-syne text-xl md:text-2xl font-bold uppercase mb-4">STAY IN THE HOOD.</h2>
          <p className="font-outfit text-[11px] md:text-xs text-brand-off-white/60 tracking-widest uppercase mb-10 max-w-md leading-relaxed">
            Private Drops. New Releases. Noise worth receiving.
          </p>
          <form className="flex w-full max-w-md border-b border-brand-dark-gray pb-3 focus-within:border-brand-off-white transition-colors group">
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="bg-transparent w-full outline-none font-outfit text-xs md:text-sm tracking-widest uppercase placeholder:text-brand-off-white/30"
              required
            />
            <button type="submit" className="font-outfit text-xs md:text-sm tracking-widest font-bold uppercase ml-4 text-brand-off-white hover:text-brand-off-white/60 transition-colors flex items-center gap-2 flex-shrink-0">
              JOIN <ArrowRight size={14} className="group-focus-within:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
