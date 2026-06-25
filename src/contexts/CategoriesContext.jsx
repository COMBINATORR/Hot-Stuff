import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      // 1. Load instantly from localStorage if cached
      const cached = localStorage.getItem('hs_categories');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setCategories(parsed);
            setLoading(false); // Turn off loading immediately since we have data!
          }
        } catch (e) {
          console.error('[CategoriesContext] Error parsing cached categories:', e);
        }
      }

      // 2. Fetch fresh data in the background
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, description, subcategories(id, name, slug, description)')
          .order('id', { ascending: true });

        if (error) throw error;

        const processed = (data || []).map(cat => {
          if (cat.subcategories) {
            cat.subcategories.sort((a, b) => Number(a.id) - Number(b.id));
          }
          return cat;
        });

        if (isMounted) {
          setCategories(processed);
          setError(null);
        }
        localStorage.setItem('hs_categories', JSON.stringify(processed));
      } catch (err) {
        console.error('[CategoriesContext] Error loading categories:', err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({ categories, loading, error }), [categories, loading, error]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}
