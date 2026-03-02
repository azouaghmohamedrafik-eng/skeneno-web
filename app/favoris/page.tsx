"use client";

import { useEffect, useState } from "react";
// Cambio de Supabase a Appwrite para la sesión
import { account } from "@/appwriteConfig";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/WishlistContext";
import { Trash2, ArrowLeft, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FavorisPage() {
  const router = useRouter();
  // Asumimos que tu WishlistContext maneja internamente la persistencia
  const { wishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificamos sesión con Appwrite
        await account.get();
        setAuthLoading(false);
      } catch (error) {
        // Si no hay sesión, redirigimos al login
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
          <h1 className="text-4xl font-serif mb-4">Mes Favoris</h1>
          <p className="text-sm text-gray-400 font-light uppercase tracking-widest">
            Vos rituels de soin personnels
          </p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {wishlist.map((item: any) => (
              <div key={item.id || item.$id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group relative">
                <button 
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-400 hover:text-red-600 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <Link href={`/produit/${item.id || item.$id}`}>
                  <div className="aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-[#F9F9F9]">
                    <img 
                      src={item.image_url || "/img/img1.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                  <p className="text-[#B29071] font-bold text-sm">
                    {item.price ? Number(item.price).toFixed(2) : "0.00"} DHS
                  </p>
                </Link>
                
                <Link 
                  href={`/produit/${item.id || item.$id}`}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#B29071] transition-colors"
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
            <h2 className="text-2xl font-serif mb-4">Votre liste est vide</h2>
            <p className="text-sm text-gray-400 font-light mb-10 px-6">
              Enregistrez vos produits préférés para les retrouver plus tard.
            </p>
            <Link href="/boutique" className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all">
              <ArrowLeft className="w-4 h-4" /> Retour à la boutique
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}