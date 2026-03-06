"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
import { ID, Query } from "appwrite";
import { useRouter } from "next/navigation";
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
  image_url: string;
  isGift?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [packagingInfo, setPackagingInfo] = useState<any>(null);
  const [giftRules, setGiftRules] = useState({ active: false, threshold: 0, productId: "" });
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [useSaved, setUseSaved] = useState(true);
  const [hasProfileInfo, setHasProfileInfo] = useState(false);
  const [savedGiftMessage, setSavedGiftMessage] = useState("");

  useEffect(() => {
    const msg = localStorage.getItem("skineno_gift_message") || "";
    setSavedGiftMessage(msg);

    async function initCheckout() {
      try {
        const user = await account.get();
        setUserId(user.$id);

        try {
          const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', user.$id);
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.address && profile.city && profile.phone) {
            setAddress(profile.address);
            setCity(profile.city);
            setPhone(profile.phone);
            setHasProfileInfo(true);
          }
        } catch {}

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

        const ids = cart.map(item => item.product_id).filter(id => id && id !== "gift_box" && id !== "gift_bag");
        let fullData: ProductDetail[] = [];
          
        if (ids.length > 0) {
          const res = await databases.listDocuments(DATABASE_ID, 'products', [Query.equal('$id', ids)]);
          fullData = res.documents.map((doc: any) => ({
            $id: doc.$id,
            name: doc.name,
            price: doc.price,
            image_url: doc.image_url,
            quantity: cart.find(c => c.product_id === doc.$id)?.quantity || 1,
            isGift: doc.$id === currentGiftId
          }));
        }

        // Añadir regalo visualmente si existe en carrito
        if (currentGiftId && cart.some(c => c.product_id === currentGiftId)) {
          try {
            const giftProd = await databases.getDocument(DATABASE_ID, 'gift_inventory', currentGiftId);
            fullData.push({
              $id: giftProd.$id,
              name: giftProd.name,
              price: 0,
              quantity: 1,
              image_url: giftProd.image_url,
              isGift: true
            } as any);
          } catch (e) {}
        }
        // Mostrar regalo también cuando se supera el umbral, aunque no esté en el carrito
        if (currentGiftId && fullData.length > 0) {
          const productSum = fullData
            .filter(p => !p.isGift)
            .reduce((sum, p) => sum + (p.price * p.quantity), 0);
          const threshold = typeof pkgRes?.documents?.[0]?.gift_threshold === 'number' 
            ? pkgRes.documents[0].gift_threshold 
            : 0;
          const giftAlreadyIncluded = fullData.some(p => p.isGift);
          if (!giftAlreadyIncluded && productSum >= threshold) {
            try {
              const giftProd = await databases.getDocument(DATABASE_ID, 'gift_inventory', currentGiftId);
              fullData.push({
                $id: giftProd.$id,
                name: giftProd.name,
                price: 0,
                quantity: 1,
                image_url: giftProd.image_url,
                isGift: true
              } as any);
            } catch (e) {}
          }
        }
        setProducts(fullData);
        setLoading(false);
      } catch (err) { router.push("/login"); }
    }
    initCheckout();
  }, [cart, router]);

  const productsTotal = products.reduce((sum, p) => sum + (p.isGift ? 0 : p.price * p.quantity), 0);
  const boxInCart = cart.find(item => item.product_id === "gift_box");
  const bagInCart = cart.find(item => item.product_id === "gift_bag");
  const packagingTotal = (boxInCart ? (packagingInfo?.box_price * boxInCart.quantity || 0) : 0) + 
                         (bagInCart ? (packagingInfo?.bag_price * bagInCart.quantity || 0) : 0);
  const totalFinal = productsTotal + packagingTotal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || products.length === 0) return;
    setOrderLoading(true);

    try {
      let itemsArray = products.map(p => `${p.quantity}x ${p.name}${p.isGift ? ' (OFFERT)' : ''}`);
      if (boxInCart) itemsArray.push(`${boxInCart.quantity}x Coffret Cadeau`);
      if (bagInCart) itemsArray.push(`${bagInCart.quantity}x Pochette Cadeau`);
      
      const itemsSummary = itemsArray.join(", ");
      await databases.createDocument(DATABASE_ID, 'orders', ID.unique(), {
        user_id: userId, items: itemsSummary, total: totalFinal, 
        shipping_address: `${address}, ${city}`, status: "en attente", gift_message: savedGiftMessage 
      });

      window.open(`https://wa.me/212639083315?text=${encodeURIComponent(`Nouvelle commande de ${fullName}\nArticles: ${itemsSummary}\nTotal: ${totalFinal.toFixed(2)} MAD\nMessage: ${savedGiftMessage}`)}`, '_blank');
      await Promise.all(cart.map(item => databases.deleteDocument(DATABASE_ID, 'cart', item.$id!)));
      clearCart();
      localStorage.removeItem("skineno_gift_message");
      router.push("/merci");
    } catch { alert("Erreur."); } finally { setOrderLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <h2 className="text-3xl font-serif">Finaliser la commande</h2>
          <form id="orderForm" onSubmit={handlePlaceOrder} className="space-y-6">
            <input type="text" placeholder="Nom Complet" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border-b p-3 outline-none" required />
            <input type="text" placeholder="Adresse" value={address} onChange={e => setAddress(e.target.value)} className="w-full border-b p-3 outline-none" required />
            <div className="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} className="w-full border-b p-3 outline-none" required />
              <input type="tel" placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border-b p-3 outline-none" required />
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 h-fit sticky top-24">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-8 border-b pb-4">Résumé</h3>
          <div className="space-y-4 mb-10">
            {products.map(p => (
              <div key={p.$id} className={`flex justify-between items-center text-sm ${p.isGift ? 'text-amber-600 font-bold' : ''}`}>
                <div className="flex items-center gap-3"><img src={p.image_url} className="w-10 h-10 rounded object-cover"/> <span>{p.quantity}x {p.name} {p.isGift && "🎁"}</span></div>
                <span>{p.isGift ? "OFFERT" : `${(p.price * p.quantity).toFixed(2)} MAD`}</span>
              </div>
            ))}
            {boxInCart && packagingInfo && (
              <div className="flex justify-between items-center text-sm"><span className="flex items-center gap-2"><Package className="w-4 h-4"/> {boxInCart.quantity}x Coffret Cadeau</span><span>{(packagingInfo.box_price * boxInCart.quantity).toFixed(2)} MAD</span></div>
            )}
            {bagInCart && packagingInfo && (
              <div className="flex justify-between items-center text-sm"><span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> {bagInCart.quantity}x Pochette Cadeau</span><span>{(packagingInfo.bag_price * bagInCart.quantity).toFixed(2)} MAD</span></div>
            )}
            {savedGiftMessage && <div className="pt-2 italic text-xs text-gray-500 border-l-2 border-amber-300 pl-2">"{savedGiftMessage}"</div>}
            <div className="pt-4 border-t flex justify-between text-2xl font-serif"><span>Total</span><span className="text-[#B29071]">{totalFinal.toFixed(2)} MAD</span></div>
          </div>
          <button type="submit" form="orderForm" disabled={orderLoading} className="w-full bg-black text-white py-6 rounded-full font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all">
            {orderLoading ? <Loader2 className="animate-spin mx-auto"/> : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </div>
  );
}
