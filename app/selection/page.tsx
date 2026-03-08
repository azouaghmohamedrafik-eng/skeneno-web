"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { getStoreSettings } from "@/lib/data";
import { Loader2, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  price_alt?: number;
  format?: string;
  format_alt?: string;
  image_url: string;
  mini_title?: string;
  description_short?: string;
  reviews_count?: number;
}

export default function SelectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pageTitle, setPageTitle] = useState("Sélection Spéciale");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    async function fetchData() {
      try {
        // Cargar título dinámico usando helper compartido
        const storeConfig: any = await getStoreSettings();
        if (isMounted && storeConfig && storeConfig.dynamic_menu_text) {
          setPageTitle(storeConfig.dynamic_menu_text);
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          'products',
          [
            Query.equal('is_special', true),
            Query.orderAsc('name')
          ]
        );
        if (isMounted && response.documents) {
          const formatted = response.documents.map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            price: Number(doc.price),
            price_alt: Number(doc.price_alt || 0),
            format: String(doc.format || ""),
            format_alt: String(doc.format_alt || ""),
            image_url: doc.image_url,
            mini_title: doc.mini_title || "",
            description_short: doc.description_short || "",
            reviews_count: Number(doc.reviews_count || 0),
          }));
          setProducts(formatted);
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted) setLoading(false);
      }
    }
    fetchData();

    return () => { isMounted = false; clearTimeout(safetyTimer); };
  },[]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans">
          
      <header className="py-16 md:py-24 px-6 text-center bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <Star className="w-8 h-8 mx-auto mb-6 text-[#B29071] opacity-50" />
          <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight uppercase">{pageTitle}</h1>
          <p className="text-sm text-gray-500 font-light leading-relaxed uppercase tracking-[0.2em]">
            Découvrez notre sélection exclusive
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#B29071]" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:hidden">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col">
                  <Link href={`/produit/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-xl mb-3">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <h3 className="font-serif text-[19px] uppercase leading-tight truncate">{product.name}</h3>
                  <p className="text-[11px] uppercase leading-tight mt-0.5 truncate">{product.mini_title || product.description_short || "Soin Skinino"}</p>
                  {(product.format || product.format_alt) && (
                    <p className="text-[9px] uppercase leading-tight mt-0.5 text-gray-500 truncate">
                      {[product.format, product.format_alt].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => addToCart(product.id, 1)} className="w-9 h-9 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="text-[15px] leading-none font-bold">
                        {(product.price_alt || 0) > 0
                          ? `${Number(product.price).toFixed(2)} DH · ${Number(product.price_alt).toFixed(2)} DH`
                          : `${Number(product.price).toFixed(2)} DH`}
                      </p>
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
                  <p className="text-[13px] uppercase leading-tight mt-1">{product.mini_title || product.description_short || "Soin Skinino"}</p>
                  {(product.format || product.format_alt) && (
                    <p className="text-[10px] uppercase leading-tight mt-0.5 text-gray-500 truncate">
                      {[product.format, product.format_alt].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => addToCart(product.id, 1)} className="w-10 h-10 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="text-[20px] leading-none font-bold">
                        {(product.price_alt || 0) > 0
                          ? `${Number(product.price).toFixed(2)} DH · ${Number(product.price_alt).toFixed(2)} DH`
                          : `${Number(product.price).toFixed(2)} DH`}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-black" />)}
                        <span className="text-[11px] ml-1">{Number(product.reviews_count || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">Aucun produit dans cette sélection.</div>
        )}
      </main>
    </div>
  );
}
