import { motion } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';

export function AssetImage({ 
  src, 
  alt, 
  aspectRatio = "auto", 
  className = "",
  productName = "Unknown Product",
  onHoverSrc
}: { 
  src: string; 
  alt: string; 
  aspectRatio?: string; 
  className?: string;
  productName?: string;
  onHoverSrc?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const errorLogged = useRef(false);

  const handleError = () => {
    if (!errorLogged.current) {
      console.error(`
NEXTHOOD IMAGE ERROR
Product: ${productName}
Path: ${src}
      `.trim());
      errorLogged.current = true;
    }
    setHasError(true);
  };

  useEffect(() => {
    // Reset error state if src changes
    setHasError(false);
    errorLogged.current = false;
  }, [src]);

  return (
    <div 
      className={`relative bg-brand-charcoal overflow-hidden flex-shrink-0 ${className}`} 
      style={{ aspectRatio: aspectRatio !== "auto" ? aspectRatio : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!hasError ? (
        <>
          <img 
            src={src} 
            alt={alt} 
            onError={handleError}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered && onHoverSrc ? 'opacity-0' : 'opacity-100'}`}
          />
          {onHoverSrc && (
            <img 
              src={onHoverSrc} 
              alt={`${alt} hover view`} 
              onError={handleError}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-brand-charcoal">
          <span className="font-outfit text-[10px] md:text-xs tracking-widest text-brand-off-white/40 uppercase bg-brand-near-black/50 px-3 py-1">
            IMAGE UNAVAILABLE
          </span>
        </div>
      )}
    </div>
  );
}

export function Logo({ className = "", variant = "full" }: { className?: string, variant?: "full" | "monogram" | "wordmark" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* NH Monogram */}
      {(variant === "full" || variant === "monogram") && (
        <svg viewBox="0 0 110 80" className="h-6 md:h-8 lg:h-10 fill-current" aria-hidden="true">
          <rect x="0" y="0" width="12" height="80" />
          <polygon points="0,0 15,0 62,80 47,80" />
          <rect x="50" y="0" width="12" height="80" />
          <rect x="62" y="34" width="36" height="12" />
          <rect x="98" y="0" width="12" height="80" />
        </svg>
      )}
      
      {/* NEXTHOOD Wordmark */}
      {(variant === "full" || variant === "wordmark") && (
        <>
          <div className="font-syne font-bold tracking-[0.2em] md:tracking-[0.25em] text-sm md:text-base lg:text-lg mt-2 uppercase leading-none pl-[0.2em]">
            NEXTHOOD
          </div>
          <div className="font-outfit text-[0.45rem] md:text-[0.55rem] tracking-[0.3em] md:tracking-[0.4em] mt-1 flex items-center justify-center w-full uppercase text-brand-off-white/90 pl-[0.3em]">
            <span className="h-px w-3 md:w-4 bg-current mr-2 md:mr-3 opacity-40"></span>
            STUDIO
            <span className="h-px w-3 md:w-4 bg-current ml-2 md:ml-3 opacity-40"></span>
          </div>
        </>
      )}
    </div>
  );
}

export function ImageSlot({ aspectRatio = "auto", text, className="" }: { aspectRatio?: string, text?: string, className?: string }) {
  return (
    <div className={`relative bg-brand-charcoal overflow-hidden flex-shrink-0 ${className}`} style={{ aspectRatio: aspectRatio !== "auto" ? aspectRatio : undefined }}>
      {text && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span className="font-outfit text-[10px] md:text-xs tracking-widest text-brand-off-white/40 uppercase bg-brand-near-black/50 px-3 py-1">
            {text}
          </span>
        </div>
      )}
    </div>
  );
}

export function Button({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }) {
  const baseStyle = "font-outfit uppercase tracking-widest text-xs md:text-sm font-semibold px-6 md:px-8 py-3 md:py-4 transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 group rounded-none";
  
  const variants = {
    primary: "bg-brand-off-white text-brand-black hover:bg-brand-white",
    secondary: "bg-brand-charcoal text-brand-off-white hover:bg-brand-dark-gray border border-brand-dark-gray",
    outline: "bg-transparent text-brand-off-white border border-brand-off-white hover:bg-brand-off-white hover:text-brand-black"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
