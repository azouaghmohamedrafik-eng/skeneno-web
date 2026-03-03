"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
import { ID, Query } from "appwrite";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Phone, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ProductDetail {
  $id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart } = useCart();
  
  // Estados de datos
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados del formulario de dirección
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [useSaved, setUseSaved] = useState(true);
  const [hasProfileInfo, setHasProfileInfo] = useState(false);

  useEffect(() => {
    async function initCheckout() {
      try {
        const user = await account.get();
        setUserId(user.$id);

        // 1. Cargar perfil para ver si tiene dirección
        try {
          const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', user.$id);
          if (profile.address && profile.city && profile.phone) {
            setAddress(profile.address);
            setCity(profile.city);
            setPhone(profile.phone);
            setHasProfileInfo(true);
          } else {
            setUseSaved(false);
          }
        } catch {
          setUseSaved(false);
        }

        // 2. Cargar detalles de productos del carrito para el resumen
        if (cart.length > 0) {
          const ids = cart.map(item => item.product_id);
          const res = await databases.listDocuments(DATABASE_ID, 'products', [Query.equal('$id', ids)]);
          
          const fullData = res.documents.map((doc: any) => ({
            $id: doc.$id,
            name: doc.name,
            price: doc.price,
            quantity: cart.find(c => c.product_id === doc.$id)?.quantity || 1
          }));
          setProducts(fullData);
        }
      } catch (err) {
        router.push("/login"); // Si no hay sesión, fuera.
      } finally {
        setLoading(false);
      }
    }
    initCheckout();
  }, [cart, router]);

  const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || products.length === 0) return;

    setOrderLoading(true);
    const fullAddress = `${address}, ${city}`;

    try {
      // 1. Crear el JSON de los productos para la tabla 'orders'
      const itemsSummary = products.map(p => `${p.quantity}x ${p.name}`).join(", ");

      // 2. Guardar el pedido en Appwrite
      const orderData = {
        user_id: userId,
        items: itemsSummary,
        total: total,
        shipping_address: fullAddress,
        status: "en attente" // Valor manual ya que no hay default
      };

      await databases.createDocument(DATABASE_ID, 'orders', ID.unique(), orderData);

      // 3. Preparar mensaje de WhatsApp
      const whatsappNumber = "212639083315"; // CAMBIA ESTO POR TU NÚMERO (con código de país)
      const message = `Bonjour Skineno! Nouveau commande:\n\n` +
                      `Produits: ${itemsSummary}\n` +
                      `Total: ${total.toFixed(2)} DHS\n\n` +
                      `Adresse: ${address}\n` +
                      `Ville: ${city}\n` +
                      `Tél: ${phone}\n\n` +
                      `Merci!`;
      
      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

      // 4. Vaciar el carrito en la base de datos
      const deletePromises = cart.map(item => databases.deleteDocument(DATABASE_ID, 'cart', item.$id!));
      await Promise.all(deletePromises);

      // 5. Redirigir: WhatsApp en pestaña nueva y web a página de éxito
      window.open(whatsappUrl, '_blank');
      router.push("/merci");

    } catch (error) {
      alert("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-[#B29071]" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* COLUMNA IZQUIERDA: DIRECCIÓN */}
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-serif mb-2">Finaliser la commande</h2>
            <p className="text-sm text-gray-400 uppercase tracking-widest">Informations de livraison</p>
          </div>

          {hasProfileInfo && (
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
              <input 
                type="checkbox" 
                checked={useSaved} 
                onChange={() => setUseSaved(!useSaved)} 
                className="w-5 h-5 accent-[#B29071]"
              />
              <div>
                <p className="text-sm font-bold">Utiliser mon adresse enregistrée</p>
                <p className="text-xs text-gray-500 italic">Evitez de remplir le formulaire à chaque fois.</p>
              </div>
            </div>
          )}

          <form id="orderForm" onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Adresse Complète</label>
              <input 
                type="text" 
                placeholder="Rue, Appt, N°..." 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                disabled={useSaved && hasProfileInfo}
                className="w-full border-b p-3 outline-none focus:border-[#B29071] transition-all bg-transparent" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Ville</label>
                <input 
                  type="text" 
                  placeholder="Ex: Casablanca" 
                  value={city} 
                  onChange={e => setCity(e.target.value)}
                  disabled={useSaved && hasProfileInfo}
                  className="w-full border-b p-3 outline-none focus:border-[#B29071] transition-all bg-transparent" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Téléphone</label>
                <input 
                  type="tel" 
                  placeholder="06XXXXXXXX" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  disabled={useSaved && hasProfileInfo}
                  className="w-full border-b p-3 outline-none focus:border-[#B29071] transition-all bg-transparent" 
                  required 
                />
              </div>
            </div>
          </form>

          <div className="p-6 bg-[#B29071]/5 rounded-2xl border border-[#B29071]/10 flex gap-4">
            <CreditCard className="w-6 h-6 text-[#B29071] shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Paiement Cash on Delivery:</strong> Vous paierez en espèces directement au livreur lors de la réception de votre colis.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 h-fit sticky top-24">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 border-b pb-4">Résumé de votre panier</h3>
          
          <div className="space-y-4 mb-10">
            {products.map(p => (
              <div key={p.$id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{p.quantity}x {p.name}</span>
                <span className="font-bold">{(p.price * p.quantity).toFixed(2)} DHS</span>
              </div>
            ))}
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-400">Livraison</span>
                <span className="text-green-600 font-bold">Gratuite</span>
              </div>
              <div className="flex justify-between text-2xl font-serif pt-2">
                <span>Total</span>
                <span className="text-[#B29071]">{total.toFixed(2)} DHS</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            form="orderForm"
            disabled={orderLoading || products.length === 0}
            className="w-full bg-black text-white py-6 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all flex items-center justify-center gap-3 shadow-2xl disabled:bg-gray-200"
          >
            {orderLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>Confirmer et commander <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          
          <p className="text-[9px] text-gray-400 text-center mt-6 uppercase leading-relaxed font-bold tracking-widest">
            En cliquant, vous serez redirigé vers WhatsApp pour finaliser l'envoi.
          </p>
        </div>

      </div>
    </div>
  );
}