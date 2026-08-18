import { useState, useEffect } from 'react';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nexthood_wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      let next;
      if (prev.includes(productId)) {
        next = prev.filter(id => id !== productId);
      } else {
        next = [...prev, productId];
      }
      localStorage.setItem('nexthood_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return { wishlist, toggleWishlist, isInWishlist };
}
