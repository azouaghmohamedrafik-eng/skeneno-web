"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import Link from "next/link";
import { Loader2, ShoppingBag, Heart, CheckCircle2 } from "lucide-react";
// Importación de los contextos
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";

export default function BoutiquePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedNotify, setAddedNotify] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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

  // Función para añadir al carrito desde la rejilla
  const handleQuickAdd = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); // Evita que el click dispare navegación
    try {
      await addToCart(productId, 1);
      setAddedNotify(true);
      setTimeout(() => setAddedNotify(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    toggleWishlist({
      $id: product.$id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    } as any);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {products.map((product) => (
            <div key={product.$id} className="group flex flex-col">
              {/* Contenedor de Imagen con Overlay */}
              <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-2xl shadow-sm mb-6">
                <Link href={`/produit/${product.$id}`}>
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </Link>
                
                {/* Botones que aparecen en Hover */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button 
                      onClick={(e) => handleQuickAdd(e, product.$id)}
                      className="flex-1 bg-black text-white py-3 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-[#B29071] transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-3 h-3" /> Ajouter
                    </button>
                    <button 
                      onClick={(e) => handleToggleWishlist(e, product)}
                      className={`p-3 rounded-full border transition-all ${isInWishlist(product.$id) ? "bg-[#B29071] border-[#B29071] text-white" : "bg-white/80 backdrop-blur-sm border-transparent text-black hover:bg-white"}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.$id) ? "fill-current" : ""}`} />
                    </button>
                </div>
              </div>

              {/* Información del Producto */}
              <div className="text-center">
                <Link href={`/produit/${product.$id}`}>
                  <h3 className="font-serif text-xl mb-1 hover:text-[#B29071] transition-colors">{product.name}</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">{product.format || "Format standard"}</p>
                  <p className="text-[#B29071] font-bold tracking-widest">{Number(product.price).toFixed(2)} MAD</p>
                </Link>
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
