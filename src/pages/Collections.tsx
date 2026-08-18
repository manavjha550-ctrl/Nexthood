import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AssetImage, Button } from '../components/ui';

import { ProductCard } from '../components/ProductCard';

export function Collections() {
  
  const [graphicSeriesProducts, setGraphicSeriesProducts] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        setGraphicSeriesProducts(data.filter((p: any) => p.collection === 'Graphic Series').slice(0, 4));
      });
  }, []);


  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 lg:px-12 mb-16 text-center">
        <h1 className="font-syne text-3xl md:text-5xl font-bold uppercase tracking-wide mb-4">
          COLLECTIONS
        </h1>
        <p className="font-outfit text-xs md:text-sm tracking-widest text-brand-off-white/60 uppercase max-w-xl mx-auto leading-relaxed">
          CURATED DROPS AND THEMATIC RELEASES.
        </p>
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        {/* GRAPHIC SERIES COLLECTION */}
        <section className="mb-24">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12 items-center">
            <div className="w-full lg:w-1/2">
              <Link to="/collections/graphic-series" className="block relative overflow-hidden group">
                <AssetImage 
                  src="/images/products/starboy_front.jpg" 
                  alt="Graphic Series Campaign" 
                  productName="Graphic Series"
                  aspectRatio="4/3"
                  className="w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-transparent transition-colors"></div>
              </Link>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col items-start">
              <h2 className="font-syne text-2xl md:text-4xl font-bold uppercase tracking-wide mb-4">
                GRAPHIC SERIES
              </h2>
              <p className="font-outfit text-sm md:text-base tracking-widest text-brand-off-white/70 uppercase mb-8 leading-relaxed max-w-md">
                A study in brutalist typography and contemporary iconography. Heavyweight cotton canvases engineered for the modern uniform.
              </p>
              <div className="flex gap-4">
                <Link to="/collections/graphic-series">
                  <Button variant="primary">Shop Collection</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {graphicSeriesProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
