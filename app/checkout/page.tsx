"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
import { ID, Query } from "appwrite";
import { useRouter } from "next/navigation";
// CORRECCIÓN: Importación completa de iconos
import { 
  Loader2, 
  MapPin, 
  Phone, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBag, 
  Package, 
  Gift,
  User 
} from "lucide-react";
import Link from "next/link";

interface ProductDetail {
  $id: string;
  name: string;
  price: number;
  quantity: number;
  isGift?: boolean; 
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  
  // Estados de datos
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [packagingInfo, setPackagingInfo] = useState<any>(null);
  const [giftRules, setGiftRules] = useState({ active: false, threshold: 0, productId: "" });
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados del formulario (Añadido fullName)
  const [fullName, setFullName] = useState("");
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

        // 1. Cargar perfil para ver si tiene datos guardados
        try {
          const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', user.$id);
          if (profile.full_name) setFullName(profile.full_name);
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

        // 2. Cargar Configuración de Regalo y Packaging
        const pkgRes = await databases.listDocuments(DATABASE_ID, "packaging_settings", [Query.limit(1)]);
        let currentGiftId = "";
        if (pkgRes.documents.length > 0) {
          const data: any = pkgRes.documents[0];
          setPackagingInfo(data);
          currentGiftId = data.gift_product_id || "";
          setGiftRules({ 
            active: data.gift_active || false, 
            threshold: data.gift_threshold || 0, 
            productId: currentGiftId 
          });
        }

        // 3. Cargar detalles de productos del carrito
        if (cart.length > 0) {
          const ids = cart.map(item => item.product_id).filter(id => id !== "gift_box" && id !== "gift_bag");
          
          if (ids.length > 0) {
            const res = await databases.listDocuments(DATABASE_ID, 'products', [Query.equal('$id', ids)]);
            
            const fullData = res.documents.map((doc: any) => ({
              $id: doc.$id,
              name: doc.name,
              price: doc.price,
              quantity: cart.find(c => c.product_id === doc.$id)?.quantity || 1,
              isGift: doc.$id === currentGiftId
            }));
            setProducts(fullData);
          }
        }
      } catch (err) {
        router.push("/login"); 
      } finally {
        setLoading(false);
      }
    }
    initCheckout();
  }, [cart, router]);

  // --- CÁLCULOS DE TOTAL (MAD) ---
  const productsTotal = products.reduce((sum, p) => {
    return sum + (p.isGift ? 0 : p.price * p.quantity);
  }, 0);

  const boxInCart = cart.find(item => item.product_id === "gift_box");
  const bagInCart = cart.find(item => item.product_id === "gift_bag");
  const packagingTotal = (boxInCart ? (packagingInfo?.box_price * boxInCart.quantity || 0) : 0) + 
                         (bagInCart ? (packagingInfo?.bag_price * bagInCart.quantity || 0) : 0);
  
  const totalFinal = productsTotal + packagingTotal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || products.length === 0) return;

    setOrderLoading(true);
    const fullAddress = `${address}, ${city}`;

    try {
      // 1. Crear el resumen detallado
      let itemsArray = products.map(p => `${p.quantity}x ${p.name}${p.isGift ? ' (OFFERT)' : ''}`);
      if (boxInCart) itemsArray.push(`${boxInCart.quantity}x Coffret Cadeau`);
      if (bagInCart) itemsArray.push(`${bagInCart.quantity}x Pochette Cadeau`);
      
      const itemsSummary = itemsArray.join(", ");

      // 2. Guardar el pedido en Appwrite
      const orderData = {
        user_id: userId,
        items: itemsSummary,
        total: totalFinal,
        shipping_address: fullAddress,
        status: "en attente"
      };

      await databases.createDocument(DATABASE_ID, 'orders', ID.unique(), orderData);

      // 3. Preparar mensaje de WhatsApp con Nombre Completo
      const whatsappNumber = "212639083315"; 
      const message = `Bonjour Skineno! Nouvelle commande de ${fullName}:\n\n` +
                      `Produits: ${itemsSummary}\n` +
                      `Total: ${totalFinal.toFixed(2)} MAD\n\n` +
                      `Adresse: ${address}\n` +
                      `Ville: ${city}\n` +
                      `Tél: ${phone}\n\n` +
                      `Merci!`;
      
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // 4. Vaciar el carrito en la base de datos
      const deletePromises = cart.map(item => databases.deleteDocument(DATABASE_ID, 'cart', item.$id!));
      await Promise.all(deletePromises);

      // 5. Vaciar el estado local
      clearCart();

      window.open(whatsappUrl, '_blank');
      router.push("/merci");

    } catch (error) {
      alert("Erreur lors de la commande.");
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
    <div className="max-w-6xl mx-auto px-6 py-20 text-black font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
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
                <p className="text-sm font-bold">Utiliser mes informations enregistrées</p>
                <p className="text-xs text-gray-500 italic">Votre nom, adresse y teléfono serán cargados automáticamente.</p>
              </div>
            </div>
          )}

          <form id="orderForm" onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Nom Complet</label>
              <input 
                type="text" 
                placeholder="Votre nom et prénom" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                disabled={useSaved && hasProfileInfo}
                className="w-full border-b p-3 outline-none focus:border-[#B29071] transition-all bg-transparent" 
                required 
              />
            </div>

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
              <div key={p.$id} className={`flex justify-between items-center text-sm ${p.isGift ? 'text-amber-600 font-bold' : 'text-gray-600'}`}>
                <span className="font-medium">{p.quantity}x {p.name} {p.isGift && "🎁"}</span>
                <span className="font-bold">{p.isGift ? "OFFERT" : `${(p.price * p.quantity).toFixed(2)} MAD`}</span>
              </div>
            ))}

            {boxInCart && packagingInfo && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-medium flex items-center gap-2"><Package className="w-3 h-3"/> {boxInCart.quantity}x Coffret Cadeau</span>
                <span className="font-bold">{(packagingInfo.box_price * boxInCart.quantity).toFixed(2)} MAD</span>
              </div>
            )}
            {bagInCart && packagingInfo && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-medium flex items-center gap-2"><ShoppingBag className="w-3 h-3"/> {bagInCart.quantity}x Pochette Cadeau</span>
                <span className="font-bold">{(packagingInfo.bag_price * bagInCart.quantity).toFixed(2)} MAD</span>
              </div>
            )}

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-widest">
                <span className="text-gray-400">Livraison</span>
                <span className="text-green-600 font-bold">Gratuite</span>
              </div>
              <div className="flex justify-between text-2xl font-serif pt-2">
                <span>Total</span>
                <span className="text-[#B29071]">{totalFinal.toFixed(2)} MAD</span>
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