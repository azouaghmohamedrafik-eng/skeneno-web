"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { databases, DATABASE_ID } from "@/appwriteConfig"; // Cambiado a Appwrite
import { Query } from "appwrite";
import Navbar from "@/components/Navbar";
import { Loader2, Heart, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";

interface Product {
  id: string; // Appwrite usa strings para IDs ($id)
  name: string;
  price: number;
  image_url: string;
  format: string;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
          // Consulta a Appwrite
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
              price: doc.price,
              image_url: doc.image_url,
              format: doc.format
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans">
      <header className="py-16 md:py-24 px-6 text-center bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto uppercase">
          <div className="flex justify-center items-center gap-2 text-[10px] tracking-[0.3em] text-[#B29071] mb-4 font-bold">
            <Link href="/boutique">Boutique</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{slug}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">{slug}</h1>
          <p className="text-sm text-gray-500 font-light leading-relaxed tracking-[0.2em]">
            Collection {slug}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#B29071]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-2xl shadow-sm mb-6">
                  <Link href={`/produit/${product.id}`}>
                    <img src={product.image_url || "/img/img1.jpg"} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </Link>
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button onClick={() => addToCart(product as any, 1)} className="flex-1 bg-black text-white py-3 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-[#B29071] transition-colors flex items-center justify-center gap-2">
                      <ShoppingBag className="w-3 h-3" /> Ajouter
                    </button>
                    <button onClick={() => toggleWishlist(product as any)} className={`p-3 rounded-full border transition-all ${isInWishlist(product.id) ? "bg-[#B29071] border-[#B29071] text-white" : "bg-white/80 backdrop-blur-sm border-transparent text-black hover:bg-white"}`}>
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <Link href={`/produit/${product.id}`}>
                    <h3 className="font-serif text-xl mb-1">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{product.format || "Format standard"}</p>
                    <p className="text-[#B29071] font-bold tracking-widest">{product.price.toFixed(2)} DHS</p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">Aucun produit dans cette catégorie pour le moment.</div>
        )}
      </main>
    </div>
  );
}