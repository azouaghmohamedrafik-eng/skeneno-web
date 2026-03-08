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
const GUEST_CART_KEY = "skineno_guest_cart";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const syncCartForUser = async (uid: string) => {
    const res = await databases.listDocuments(DATABASE_ID, "cart", [
      Query.equal("user_id", uid)
    ]);
    setCart(res.documents.map(doc => ({
      $id: doc.$id,
      product_id: doc.product_id,
      quantity: doc.quantity,
      user_id: doc.user_id
    })));
  };

  const readGuestCart = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((row: any) => ({
          $id: String(row?.$id || `guest_${String(row?.product_id || "")}`),
          product_id: String(row?.product_id || ""),
          quantity: Number(row?.quantity || 0),
          user_id: "guest"
        }))
        .filter((row: CartItem) => row.product_id.length > 0 && row.quantity > 0);
    } catch {
      return [];
    }
  };

  const writeGuestCart = (items: CartItem[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  };

  useEffect(() => {
    async function initCart() {
      try {
        const currentUser = await account.get();
        setUserId(currentUser.$id);
        await syncCartForUser(currentUser.$id);
      } catch (error) {
        setUserId(null);
        setCart(readGuestCart());
      }
    }
    initCart();
  }, []);

  const addToCart = async (productId: string, qty: number) => {
    if (!userId) {
      const wasEmptyCart = cart.length === 0;
      let nextGuestCart: CartItem[] = [];
      setCart((prev) => {
        const existing = prev.find((item) => item.product_id === productId);
        if (existing) {
          const newQty = existing.quantity + qty;
          nextGuestCart = newQty <= 0
            ? prev.filter((item) => item.product_id !== productId)
            : prev.map((item) => item.product_id === productId ? { ...item, quantity: newQty } : item);
        } else if (qty > 0) {
          nextGuestCart = [...prev, { $id: `guest_${productId}`, product_id: productId, quantity: qty, user_id: "guest" }];
        } else {
          nextGuestCart = prev;
        }
        return nextGuestCart;
      });
      writeGuestCart(nextGuestCart);
      if (wasEmptyCart && qty > 0) {
        setIsCartDrawerOpen(true);
      }
      return;
    }

    try {
      const wasEmptyCart = cart.length === 0;
      const existing = cart.find(item => item.product_id === productId);

      if (existing && existing.$id) {
        const newQty = existing.quantity + qty;
        if (newQty <= 0) {
          await databases.deleteDocument(DATABASE_ID, "cart", existing.$id);
          setCart(prev => prev.filter(item => item.$id !== existing.$id));
        } else {
          await databases.updateDocument(DATABASE_ID, "cart", existing.$id, {
            quantity: newQty
          });
          setCart(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: newQty } : item));
        }
      } else {
        const newDoc = await databases.createDocument(DATABASE_ID, "cart", ID.unique(), {
          user_id: userId,
          product_id: productId,
          quantity: qty
        });
        setCart(prev => [...prev, { $id: newDoc.$id, product_id: productId, quantity: qty, user_id: userId }]);
        if (wasEmptyCart && qty > 0) {
          setIsCartDrawerOpen(true);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (cartDocId: string) => {
    if (!userId) {
      setCart((prev) => {
        const next = prev.filter((item) => item.$id !== cartDocId);
        writeGuestCart(next);
        return next;
      });
      return;
    }
    try {
      await databases.deleteDocument(DATABASE_ID, "cart", cartDocId);
      setCart(prev => prev.filter(item => item.$id !== cartDocId));
    } catch (error) {
      console.error("Error removing:", error);
    }
  };

  // FUNCIÓN PARA VACIAR EL ESTADO LOCAL
  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_CART_KEY);
    }
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
