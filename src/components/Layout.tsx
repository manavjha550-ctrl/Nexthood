import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Logo } from './ui';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BagDrawer } from './BagDrawer';

function SearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-brand-near-black">
      <div className="flex items-center justify-between px-6 lg:px-12 py-6 border-b border-brand-charcoal">
        <Logo variant="monogram" />
        <button onClick={onClose} className="text-brand-off-white/50 hover:text-brand-white transition-colors">
          <X size={24} strokeWidth={1} />
        </button>
      </div>
      <div className="flex-1 container mx-auto px-6 flex flex-col justify-center items-center">
        <form className="w-full max-w-2xl relative" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <input 
            id="searchInput"
            type="text" 
            placeholder="SEARCH CATALOG" 
            className="w-full bg-transparent border-b-2 border-brand-charcoal text-2xl md:text-4xl font-syne font-bold uppercase tracking-wide py-4 px-2 focus:outline-none focus:border-brand-off-white placeholder:text-brand-off-white/20 transition-colors"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-off-white/40 hover:text-brand-white transition-colors">
            <Search size={24} strokeWidth={1.5} />
          </button>
        </form>
        <div className="mt-12 flex gap-4 font-outfit text-xs tracking-widest uppercase text-brand-off-white/50">
          <span className="cursor-pointer hover:text-brand-white transition-colors">Trending: T-Shirts</span>
          <span className="cursor-pointer hover:text-brand-white transition-colors">Trending: Long Sleeve</span>
        </div>
      </div>
    </div>
  );
}

function DesktopHeader({ scrolled, onSearchClick, wishlistCount, cartCount, openDrawer }: { scrolled: boolean, onSearchClick: () => void, wishlistCount: number, cartCount: number, openDrawer: () => void }) {
  const { user } = useAuth();
  return (
    <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 hidden md:block ${scrolled ? 'bg-brand-near-black/95 backdrop-blur-sm border-b border-brand-charcoal py-4' : 'bg-transparent py-8'}`}>
      <div className="container mx-auto px-12 flex items-center justify-between">
        <nav className="flex gap-8 font-outfit text-xs font-medium tracking-widest uppercase flex-1">
          <Link to="/shop" className="hover:text-brand-off-white/60 transition-colors">Shop</Link>
          <Link to="/collections" className="hover:text-brand-off-white/60 transition-colors">Collections</Link>
          <Link to="/shop" className="hover:text-brand-off-white/60 transition-colors">Campaigns</Link>
        </nav>
        
        <Link to="/" className="flex-shrink-0">
          <Logo variant="full" />
        </Link>
        
        <div className="flex gap-6 items-center justify-end flex-1">
          <button onClick={onSearchClick} className="hover:text-brand-off-white/60 transition-colors"><Search size={16} strokeWidth={1.5} /></button>
          <button className="hover:text-brand-off-white/60 transition-colors"><User size={16} strokeWidth={1.5} /></button>
          <button className="hover:text-brand-off-white/60 transition-colors flex items-center gap-1"><Heart size={16} strokeWidth={1.5} /><span className="font-outfit text-[10px] tracking-widest">{wishlistCount > 0 ? `(${wishlistCount})` : ''}</span></button>
          <button onClick={openDrawer} className="hover:text-brand-off-white/60 transition-colors flex items-center gap-2">
            <ShoppingBag size={16} strokeWidth={1.5} />
            <span className="font-outfit text-[11px] tracking-widest">({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileHeader({ scrolled, toggleMenu, menuOpen, onSearchClick, cartCount, openDrawer }: { scrolled: boolean, toggleMenu: () => void, menuOpen: boolean, onSearchClick: () => void, cartCount: number, openDrawer: () => void }) {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 md:hidden ${scrolled || menuOpen ? 'bg-brand-near-black/95 backdrop-blur-sm border-b border-brand-charcoal py-3' : 'bg-transparent py-3'}`}>
      <div className="px-4 flex items-center justify-between">
        <button onClick={toggleMenu} className="p-2 -ml-2 text-brand-off-white hover:text-brand-off-white/60">
          {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <Logo variant="full" />
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={onSearchClick} className="hover:text-brand-off-white/60 transition-colors p-1"><Search size={18} strokeWidth={1.5} /></button>
          <button onClick={openDrawer} className="hover:text-brand-off-white/60 transition-colors p-1 flex items-center gap-1">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && <span className="font-outfit text-[10px] tracking-widest">({cartCount})</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function NavigationDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const links = [
    {name:"Shop", path:"/shop"},
    {name:"Collections", path:"/collections"},
    {name:"T-Shirts", path:"/collections/t-shirts"},
    {name:"Long Sleeve", path:"/collections/long-sleeve"}
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-[72px] left-0 w-full sm:w-[320px] h-[calc(100vh-72px)] bg-brand-near-black border-r border-brand-charcoal z-40 flex flex-col md:hidden"
          >
            <nav className="flex flex-col px-8 py-8 gap-6 overflow-y-auto">
              {links.map((link, i) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={onClose}
                  className="font-syne text-2xl font-semibold uppercase hover:text-brand-off-white/60 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto p-8 border-t border-brand-charcoal">
              <div className="flex items-center gap-6">
                {user ? (
                  <Link to="/account" onClick={onClose} className="font-outfit text-xs tracking-widest uppercase">{user.fullName.split(" ")[0]}</Link>
                ) : (
                  <Link to="/login" onClick={onClose} className="font-outfit text-xs tracking-widest uppercase">Account</Link>
                )}
                <Link to="/shop" onClick={onClose} className="font-outfit text-xs tracking-widest uppercase">Wishlist</Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-near-black border-t border-brand-charcoal pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1 md:col-span-2 flex flex-col items-start">
            <Logo variant="full" className="mb-6 origin-left scale-90" />
            <p className="font-outfit text-brand-off-white/60 text-[11px] md:text-xs max-w-xs tracking-widest leading-relaxed uppercase">
              BUILT FOR THE NEXT.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">Shop</Link>
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">Collections</Link>
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">About</Link>
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">Contact</Link>
          </div>
          <div className="flex flex-col gap-4">
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">Instagram</Link>
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">Email</Link>
            <Link to="/shop" className="font-outfit text-[11px] md:text-xs tracking-widest uppercase hover:text-brand-off-white/60 transition-colors">Newsletter</Link>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-6 border-t border-brand-dark-gray gap-4">
          <p className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40">
            © NEXTHOOD STUDIO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/shop" className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40 hover:text-brand-off-white transition-colors">Privacy</Link>
            <Link to="/shop" className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40 hover:text-brand-off-white transition-colors">Terms</Link>
            <Link to="/shop" className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40 hover:text-brand-off-white transition-colors">Shipping</Link>
            <Link to="/shop" className="font-outfit text-[10px] tracking-widest uppercase text-brand-off-white/40 hover:text-brand-off-white transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { wishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { items, openDrawer } = useCart();
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-brand-near-black text-brand-off-white">
      {!isCheckout && (
        <>
          <DesktopHeader scrolled={scrolled} onSearchClick={() => setSearchOpen(true)} wishlistCount={wishlist.length} cartCount={cartCount} openDrawer={openDrawer} />
          <MobileHeader scrolled={scrolled} toggleMenu={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} onSearchClick={() => setSearchOpen(true)} cartCount={cartCount} openDrawer={openDrawer} />
          <NavigationDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      <BagDrawer />
      
      {!isCheckout && <Footer />}
      
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
