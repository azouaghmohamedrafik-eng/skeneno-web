"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function BoutiquePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID, 
          'products', 
          [Query.orderAsc('name')]
        );
        setProducts(response.documents);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="w-10 h-10 animate-spin text-[#B29071]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans">
      <header className="py-16 md:py-24 px-6 text-center bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Tous nos produits</h1>
          <p className="text-sm text-gray-500 font-light leading-relaxed uppercase tracking-[0.2em]">
            Découvrez l'intégralité de la collection Skineno
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {products.map((product) => (
            <Link href={`/produit/${product.$id}`} key={product.$id} className="group flex flex-col">
              <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-2xl shadow-sm mb-6">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="text-center">
                <h3 className="font-serif text-xl mb-1">{product.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{product.format}</p>
                <p className="text-[#B29071] font-bold tracking-widest">{Number(product.price).toFixed(2)} DHS</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}