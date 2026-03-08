"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { databases, DATABASE_ID } from "@/appwriteConfig"; 
import { Query } from "appwrite";
import { Loader2, ShoppingBag, ChevronRight, CheckCircle2, Star } from "lucide-react";
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

const categoryConfig: Record<string, { title: string; image: string }> = {
  visage: { title: "SOINS VISAGE", image: "/img/visage.webp" },
  corps: { title: "SOINS CORPS", image: "/img/corps.webp" },
  cheveux: { title: "SOINS CHEVEUX", image: "/img/cheveux.webp" },
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedNotify, setAddedNotify] = useState(false);
  
  const { addToCart } = useCart();
  const currentSlug = String(slug || "").toLowerCase();
  const category = categoryConfig[currentSlug];

  useEffect(() => {
    let isMounted = true;
    
    
    async function fetchByTag() {
      try {
        setLoading(true);
        let columnToFilter = "";
        const currentSlug = (slug as string).toLowerCase();

        if (currentSlug === "visage") columnToFilter = "is_visage";
        else if (currentSlug === "corps") columnToFilter = "is_corps";
        else if (currentSlug === "cheveux") columnToFilter = "is_cheveux";

        if (columnToFilter) {
          const response = await databases.listDocuments(
            DATABASE_ID, 
            'products', 
            [
              Query.equal(columnToFilter, true),
              Query.orderAsc('name')
            ]
          );
          
          if (isMounted) {
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
        }
      } catch (e) { 
        console.error("Error fetching products:", e); 
      } finally { 
        if (isMounted) setLoading(false); 
      }
    }
    fetchByTag();
    return () => { isMounted = false; };
  }, [slug]);

  // Función corregida para añadir al carrito
  const handleQuickAdd = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      setAddedNotify(true);
      setTimeout(() => setAddedNotify(false), 2000);
    } catch (error) {
      console.error("Error quick add:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans">
      
      {/* Notificación de añadido */}
      {addedNotify && (
        <div className="fixed top-24 right-6 z-50 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-[#B29071]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ajouté au panier !</span>
        </div>
      )}

      <header className="py-16 md:py-24 px-6 text-center bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto uppercase">
          <div className="flex justify-center items-center gap-2 text-[10px] tracking-[0.3em] text-[#B29071] mb-4 font-bold">
            <Link href="/" className="hover:opacity-70 transition-opacity">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="opacity-50">{currentSlug}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">{category?.title || currentSlug}</h1>
          <p className="text-sm text-gray-500 font-light leading-relaxed tracking-[0.2em]">
            Collection {category?.title || currentSlug}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#B29071]" />
          </div>
        ) : (
          <>
            <div className="mb-8 md:mb-12 rounded-2xl overflow-hidden bg-white border border-gray-100">
              <img
                src={category?.image || "/img/visage.webp"}
                alt={category?.title || "Collection"}
                className="w-full h-[200px] md:h-[300px] lg:h-[360px] object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:hidden">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col">
                  <Link href={`/produit/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-xl mb-3">
                      <img src={product.image_url || "/img/img1.jpg"} alt={product.name} className="w-full h-full object-cover" />
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
                    <button onClick={() => handleQuickAdd(product.id)} className="w-9 h-9 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
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

            <div className="hidden lg:grid grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col">
                  <Link href={`/produit/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-xl mb-3">
                      <img src={product.image_url || "/img/img1.jpg"} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <h3 className="font-serif text-[26px] uppercase leading-[0.95]">{product.name}</h3>
                  <p className="text-[12px] uppercase leading-tight mt-1">{product.mini_title || product.description_short || "Soin Skinino"}</p>
                  {(product.format || product.format_alt) && (
                    <p className="text-[10px] uppercase leading-tight mt-0.5 text-gray-500 truncate">
                      {[product.format, product.format_alt].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => handleQuickAdd(product.id)} className="w-10 h-10 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <div>
                      <p className="text-[18px] leading-none font-bold">
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
          <div className="text-center py-20 text-gray-400 italic">Aucun produit dans cette catégorie pour le moment.</div>
        )}
      </main>
    </div>
  );
}
