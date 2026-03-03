"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext"; // Importación corregida a la carpeta lib
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface FullProduct {
  $id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  cartDocId: string; // Guardamos el ID del documento del carrito para poder borrarlo
}

export default function PanierPage() {
  const { cart, removeFromCart } = useCart();
  const [products, setProducts] = useState<FullProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCartDetails() {
      if (cart.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        // CORRECCIÓN: Usamos item.product_id que es como lo llamamos en el Contexto
        const ids = cart.map((item) => item.product_id);
        
        // Buscamos los detalles de esos productos en Appwrite
        const response = await databases.listDocuments(DATABASE_ID, "products", [
          Query.equal("$id", ids),
        ]);

        const fullData = response.documents.map((doc: any) => {
          // Buscamos la info del carrito para este producto específico
          const cartInfo = cart.find((c) => c.product_id === doc.$id);
          
          return {
            $id: doc.$id,
            name: doc.name,
            price: doc.price,
            image_url: doc.image_url,
            quantity: cartInfo?.quantity || 1,
            cartDocId: cartInfo?.$id || "" // Este es el ID necesario para borrar de la DB
          };
        });

        setProducts(fullData);
      } catch (error) {
        console.error("Error loading cart details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCartDetails();
  }, [cart]);

  const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-[#B29071]" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-black">
      <h1 className="text-4xl font-serif mb-10 text-center uppercase tracking-widest">Mon Panier</h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-6 italic">Votre panier est actualmente vide.</p>
          <Link href="/" className="bg-black text-white px-10 py-4 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition">
            Découvrir nos productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-6">
            {products.map((p) => (
              <div key={p.$id} className="flex gap-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm items-center transition-all hover:shadow-md">
                <img src={p.image_url || "/placeholder.png"} className="w-20 h-24 object-cover rounded shadow-sm" alt={p.name} />
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold">{p.name}</h3>
                  <p className="text-[#B29071] font-bold mt-1">{p.price.toFixed(2)} DHS</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold">Quantité: {p.quantity}</p>
                </div>
                {/* Usamos cartDocId para borrar el documento correcto de la DB */}
                <button onClick={() => removeFromCart(p.cartDocId)} className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* RESUMEN DE COMPRA */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-50 h-fit sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 border-b pb-4">Résumé</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span className="font-bold">{total.toFixed(2)} DHS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest bg-green-50 px-2 py-1 rounded">Gratuite</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-serif">
                <span>Total</span>
                <span className="font-bold text-[#B29071]">{total.toFixed(2)} DHS</span>
              </div>
            </div>
            {/* CAMBIO REALIZADO: Ahora es un Link que apunta a /checkout */}
            <Link 
              href="/checkout" 
              className="w-full bg-black text-white py-5 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition flex items-center justify-center gap-3 shadow-lg"
            >
              Passer la commande <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}