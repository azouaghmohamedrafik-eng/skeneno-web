"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import Link from "next/link";
import { Loader2, ShoppingBag, CheckCircle2, Star } from "lucide-react";
import { useCart } from "@/lib/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  mini_title?: string;
  description_short?: string;
  reviews_count?: number;
}

export default function BoutiquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedNotify, setAddedNotify] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID, 
          'products', 
          [Query.orderAsc('name')]
        );
        const formatted = response.documents.map((doc: any) => ({
          id: doc.$id,
          name: doc.name,
          price: Number(doc.price),
          image_url: doc.image_url,
          mini_title: doc.mini_title || "",
          description_short: doc.description_short || "",
          reviews_count: Number(doc.reviews_count || 0),
        }));
        setProducts(formatted);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  // Función para añadir al carrito desde la rejilla
  const handleQuickAdd = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      setAddedNotify(true);
      setTimeout(() => setAddedNotify(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="w-10 h-10 animate-spin text-[#B29071]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans">
      
      {/* Notificación visual de éxito */}
      {addedNotify && (
        <div className="fixed top-24 right-6 z-50 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-[#B29071]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ajouté au panier !</span>
        </div>
      )}

      <header className="py-16 md:py-24 px-6 text-center bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Tous nos produits</h1>
          <p className="text-sm text-gray-500 font-light leading-relaxed uppercase tracking-[0.2em]">
            Découvrez l'intégralité de la collection Skineno
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:hidden">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col">
              <Link href={`/produit/${product.id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-xl mb-3">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <h3 className="font-serif text-[19px] uppercase leading-tight truncate">{product.name}</h3>
              <p className="text-[11px] uppercase leading-tight mt-0.5 truncate">{product.mini_title || product.description_short || "Soin Skineno"}</p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => handleQuickAdd(product.id)} className="w-9 h-9 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-[15px] leading-none font-bold">{Number(product.price).toFixed(2)} DH</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-black" />)}
                    <span className="text-[10px] ml-1">{Number(product.reviews_count || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-10">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col">
              <Link href={`/produit/${product.id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-xl mb-3">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <h3 className="font-serif text-[34px] uppercase leading-[0.95]">{product.name}</h3>
              <p className="text-[13px] uppercase leading-tight mt-1">{product.mini_title || product.description_short || "Soin Skineno"}</p>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={() => handleQuickAdd(product.id)} className="w-10 h-10 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-[20px] leading-none font-bold">{Number(product.price).toFixed(2)} DH</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-black" />)}
                    <span className="text-[11px] ml-1">{Number(product.reviews_count || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">
            Aucun produit disponible pour le momento.
          </div>
        )}
      </main>
    </div>
  );
}
