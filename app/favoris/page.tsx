"use client";

import { useEffect, useState } from "react";
import { account } from "@/appwriteConfig";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/WishlistContext";
import { Trash2, ArrowLeft, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FavorisPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await account.get();
        setAuthLoading(false);
      } catch (error) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  if (authLoading || wishlistLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#B29071]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif mb-4 uppercase tracking-widest">Mes Favoris</h1>
          <p className="text-[10px] text-[#B29071] font-bold uppercase tracking-[0.3em]">
            Vos rituels de soin personnels
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group relative transition-all hover:shadow-md">
                <button 
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-8 right-8 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-300 hover:text-red-500 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <Link href={`/produit/${item.id}`}>
                  <div className="aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-[#F9F9F9]">
                    <img 
                      src={item.image_url || "/img/placeholder.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-xl mb-2">{item.name}</h3>
                    <p className="text-[#B29071] font-bold tracking-widest">
                      {item.price ? Number(item.price).toFixed(2) : "0.00"} DHS
                    </p>
                  </div>
                </Link>
                
                <Link 
                  href={`/produit/${item.id}`}
                  className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#B29071] transition-all shadow-lg"
                >
                  Voir le produit
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-gray-200" />
            </div>
            <h2 className="text-2xl font-serif mb-4 uppercase tracking-widest">Votre liste est vide</h2>
            <p className="text-xs text-gray-400 font-light mb-10 px-6 uppercase tracking-widest leading-relaxed">
              Enregistrez vos produits préférés pour los retrouver plus tard.
            </p>
            <Link href="/boutique" className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all shadow-xl">
              <ArrowLeft className="w-4 h-4" /> Retour à la boutique
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}