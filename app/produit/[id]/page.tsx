"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// Importamos la configuración de Appwrite
import { databases, DATABASE_ID } from "@/appwriteConfig";
import Navbar from "@/components/Navbar";
import { Loader2, Minus, Plus, ShoppingBag, ChevronRight, CheckCircle2, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";

interface Product {
  id: string; // En Appwrite los IDs son strings ($id)
  name: string; 
  price: number; 
  image_url: string;
  description: string; 
  format: string; 
  ingredients: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedNotify, setAddedNotify] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Obtenemos un único documento por su ID
        const doc: any = await databases.getDocument(DATABASE_ID, 'products', id as string);
        
        if (doc) {
          setProduct({
            id: doc.$id,
            name: doc.name,
            price: doc.price,
            image_url: doc.image_url,
            description: doc.description,
            format: doc.format,
            ingredients: doc.ingredients
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedNotify(true);
      setTimeout(() => setAddedNotify(false), 3000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="w-8 h-8 animate-spin text-[#B29071]" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] space-y-4">
      <p className="text-gray-500 font-serif text-xl">Produit non trouvé.</p>
      <Link href="/" className="text-[#B29071] uppercase text-xs font-bold tracking-widest underline">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {addedNotify && (
        <div className="fixed top-24 right-6 z-50 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-[#B29071]" />
          <span className="text-xs font-bold uppercase tracking-widest">Ajouté au panier !</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
        <Link href="/" className="hover:text-black transition-colors">Accueil</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black">{product.name}</span>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="bg-[#F9F9F9] rounded-2xl overflow-hidden aspect-[4/5] shadow-sm">
          <img 
            src={product.image_url || "/img/placeholder.jpg"} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif mb-2">{product.name}</h1>
            <p className="text-[#B29071] font-bold text-xl tracking-widest">
              {Number(product.price).toFixed(2)} DHS
            </p>
            {product.format && (
              <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-[10px] font-bold uppercase tracking-widest rounded">
                Format: {product.format}
              </span>
            )}
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {product.ingredients && (
            <div className="space-y-4 border-t border-gray-100 pt-8">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Ingrédients</h3>
              <p className="text-xs text-gray-500 italic leading-relaxed">{product.ingredients}</p>
            </div>
          )}

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 w-fit bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="p-2 hover:text-[#B29071] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="p-2 hover:text-[#B29071] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart} 
              className="flex-1 bg-black text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" /> Ajouter au panier
            </button>

            <button 
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-full border transition-all ${isInWishlist(product.id) ? "bg-[#B29071]/10 border-[#B29071] text-[#B29071]" : "border-gray-200 text-gray-400 hover:border-black hover:text-black"}`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}