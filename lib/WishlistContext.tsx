"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
// usaremos Appwrite para autenticar y manejar wishlist
import { account, databases, DATABASE_ID } from '../appwriteConfig';
import { Query, ID } from 'appwrite';

interface WishlistItem {
  id: string; // los IDs en Appwrite son cadenas ($id)
  name: string;
  price: number;
  image_url: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (product: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Comprobar sesión de Appwrite e inicializar wishlist
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const u: any = await account.get();
        const uid = u.$id;
        if (!isMounted) return;
        setUserId(uid);
        if (uid) await fetchWishlist(uid);
      } catch (e) {
        if (!isMounted) return;
        setUserId(null);
        setWishlist([]);
      }
    }

    checkSession();
    // cada cierto tiempo volvemos a validar (por ejemplo, 15s)
    const interval = setInterval(checkSession, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Traer favoritos de Appwrite
  async function fetchWishlist(uid: string) {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, 'wishlist', [
        Query.equal('user_id', uid)
      ]);

      const productIds: string[] = res.documents.map((d: any) => String(d.product_id));
      let formatted: WishlistItem[] = [];

      if (productIds.length > 0) {
        // traer cada producto por su id (no hay join en Appwrite)
        const promises = productIds.map(id =>
          databases.getDocument(DATABASE_ID, 'products', id as string)
        );
        const docs = await Promise.all(promises);
        formatted = docs.filter(Boolean).map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          price: doc.price,
          image_url: doc.image_url
        }));
      }

      setWishlist(formatted);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setWishlist([]);
    }
    setLoading(false);
  }

  // 3. Añadir o Quitar de la base de datos
  const toggleWishlist = async (product: WishlistItem) => {
    if (!userId) {
      alert("Veuillez vous connecter pour enregistrer vos favoris.");
      return;
    }

    const exists = wishlist.some(item => item.id === product.id);

    if (exists) {
      try {
        // buscamos el documento para borrarlo
        const match = await databases.listDocuments(DATABASE_ID, 'wishlist', [
          Query.equal('user_id', userId),
          Query.equal('product_id', product.id)
        ]);
        if (match.documents.length > 0) {
          await databases.deleteDocument(DATABASE_ID, 'wishlist', match.documents[0].$id);
        }
        setWishlist(prev => prev.filter(item => item.id !== product.id));
      } catch (err) {
        console.error('Error deleting wishlist item:', err);
      }
    } else {
      try {
        await databases.createDocument(DATABASE_ID, 'wishlist', ID.unique(), {
          user_id: userId,
          product_id: product.id
        });
        setWishlist(prev => [...prev, product]);
      } catch (err) {
        console.error('Error adding to wishlist:', err);
      }
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