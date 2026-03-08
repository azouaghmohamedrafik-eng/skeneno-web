"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { databases, DATABASE_ID, account } from "@/appwriteConfig";
import { ID, Query } from "appwrite";

interface CartItem {
  $id?: string;
  product_id: string;
  quantity: number;
  user_id: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (cartDocId: string) => Promise<void>;
  clearCart: () => void; // NUEVA FUNCIÓN
  cartCount: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    async function initCart() {
      try {
        const currentUser = await account.get();
        setUserId(currentUser.$id);

        const res = await databases.listDocuments(DATABASE_ID, "cart", [
          Query.equal("user_id", currentUser.$id)
        ]);
        
        setCart(res.documents.map(doc => ({
          $id: doc.$id,
          product_id: doc.product_id,
          quantity: doc.quantity,
          user_id: doc.user_id
        })));
      } catch (error) {
        setUserId(null);
        setCart([]);
      }
    }
    initCart();
  }, []);

  const addToCart = async (productId: string, qty: number) => {
    if (!userId) {
      alert("Veuillez vous connecter pour ajouter des produits au panier.");
      return;
    }

    try {
      const wasEmptyCart = cart.length === 0;
      const existing = cart.find(item => item.product_id === productId);

      if (existing && existing.$id) {
        const newQty = existing.quantity + qty;
        await databases.updateDocument(DATABASE_ID, "cart", existing.$id, {
          quantity: newQty
        });
        setCart(cart.map(item => item.product_id === productId ? { ...item, quantity: newQty } : item));
      } else {
        const newDoc = await databases.createDocument(DATABASE_ID, "cart", ID.unique(), {
          user_id: userId,
          product_id: productId,
          quantity: qty
        });
        setCart([...cart, { $id: newDoc.$id, product_id: productId, quantity: qty, user_id: userId }]);
        if (wasEmptyCart && qty > 0) {
          setIsCartDrawerOpen(true);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (cartDocId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, "cart", cartDocId);
      setCart(cart.filter(item => item.$id !== cartDocId));
    } catch (error) {
      console.error("Error removing:", error);
    }
  };

  // FUNCIÓN PARA VACIAR EL ESTADO LOCAL
  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, isCartDrawerOpen, openCartDrawer, closeCartDrawer }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
