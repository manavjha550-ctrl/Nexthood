import { useState, useEffect } from 'react';

const MAX_HISTORY = 8;
const STORAGE_KEY = 'nexthood_recently_viewed';

export function useRecentlyViewed(currentProductId?: string) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let history: string[] = stored ? JSON.parse(stored) : [];

      if (currentProductId) {
        // Remove if it already exists to move it to the front
        history = history.filter(id => id !== currentProductId);
        // Add to front
        history.unshift(currentProductId);
        // Trim to max history
        history = history.slice(0, MAX_HISTORY);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
      
      setRecentIds(history);
    } catch (e) {
      console.error('Error accessing recently viewed', e);
    }
  }, [currentProductId]);

  return recentIds;
}
