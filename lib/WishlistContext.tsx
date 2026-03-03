"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, databases, DATABASE_ID } from '../appwriteConfig';
import { Query, ID } from 'appwrite';

interface WishlistItem {
  id: string; 
  name: string;
  price: number;
  image_url: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (product: any) => void; // Cambiado a any para mayor flexibilidad con $id
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const u: any = await account.get();
        if (!isMounted) return;
        setUserId(u.$id);
        await fetchWishlist(u.$id);
      } catch (e) {
        if (!isMounted) return;
        setUserId(null);
        setWishlist([]);
      }
    }
    checkSession();
    return () => { isMounted = false; };
  }, []);

  async function fetchWishlist(uid: string) {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, 'wishlist', [
        Query.equal('user_id', uid)
      ]);

      const productIds = res.documents.map((d: any) => d.product_id);
      
      if (productIds.length > 0) {
        const promises = productIds.map(id =>
          databases.getDocument(DATABASE_ID, 'products', id)
        );
        const docs = await Promise.all(promises);
        const formatted = docs.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          price: doc.price,
          image_url: doc.image_url
        }));
        setWishlist(formatted);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleWishlist = async (product: any) => {
    if (!userId) {
      alert("Veuillez vous connecter pour enregistrer vos favoris.");
      return;
    }

    // NORMALIZACIÓN DEL ID: Detectamos si viene como 'id' o como '$id'
    const productId = product.id || product.$id;

    if (!productId) {
      console.error("Error: No se pudo encontrar el ID del producto", product);
      return;
    }

    const exists = wishlist.some(item => item.id === productId);

    try {
      if (exists) {
        const match = await databases.listDocuments(DATABASE_ID, 'wishlist', [
          Query.equal('user_id', userId),
          Query.equal('product_id', productId)
        ]);
        if (match.documents.length > 0) {
          await databases.deleteDocument(DATABASE_ID, 'wishlist', match.documents[0].$id);
        }
        setWishlist(prev => prev.filter(item => item.id !== productId));
      } else {
        // AQUÍ ESTABA EL ERROR: Ahora aseguramos que se envía 'productId'
        await databases.createDocument(DATABASE_ID, 'wishlist', ID.unique(), {
          user_id: userId,
          product_id: productId 
        });
        
        // Añadimos al estado local para feedback instantáneo
        setWishlist(prev => [...prev, {
          id: productId,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        }]);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const isInWishlist = (id: string) => wishlist.some(item => item.id === id);
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, wishlistCount, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist debe usarse dentro de WishlistProvider");
  return context;
}