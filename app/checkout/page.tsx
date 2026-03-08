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

const ALT_VARIANT_SUFFIX = "::alt";

interface ProductDetail {
  $id: string;
  cartProductId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  format?: string;
  isGift?: boolean;
}

interface OrderItemRow {
  product_id: string;
  cart_product_id?: string;
  format?: string;
  quantity: number;
  isGift: boolean;
  item_type: "product" | "packaging";
}

interface DeliverySettings {
  panel_title?: string;
  section_1_title?: string;
  section_1_content?: string;
  section_2_title?: string;
  section_2_content_html?: string;
  notes_html?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  
  const getBaseProductId = (cartProductId: string) => (
    cartProductId.endsWith(ALT_VARIANT_SUFFIX)
      ? cartProductId.slice(0, -ALT_VARIANT_SUFFIX.length)
      : cartProductId
  );
  const isAltVariantProductId = (cartProductId: string) => cartProductId.endsWith(ALT_VARIANT_SUFFIX);

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
  const [boxSize] = useState("Moyen");
  const [bagSize] = useState("Petit");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<null | "shipping">(null);

  useEffect(() => {
    const msg = localStorage.getItem("skineno_gift_message") || "";
    setSavedGiftMessage(msg);

    async function initCheckout() {
      try {
        const PACKAGING_CACHE_KEY = "skineno_packaging_cache";
        const cachedPackaging = localStorage.getItem(PACKAGING_CACHE_KEY);
        if (cachedPackaging) {
          try {
            const cachedData: any = JSON.parse(cachedPackaging);
            setPackagingInfo(cachedData);
            setGiftRules({
              active: cachedData.gift_active || false,
              threshold: cachedData.gift_threshold || 0,
              productId: cachedData.gift_product_id || ""
            });
          } catch {}
        }
        const user = await account.get().catch(() => null);
        if (user) {
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
        } else {
          setUserId(null);
        }

        const pkgRes = await databases.listDocuments(DATABASE_ID, "packaging_settings", [Query.limit(1)]).catch(() => null);
        let currentGiftId = "";
        if (pkgRes && pkgRes.documents.length > 0) {
          const data: any = pkgRes.documents[0];
          setPackagingInfo(data);
          localStorage.setItem(PACKAGING_CACHE_KEY, JSON.stringify(data));
          currentGiftId = data.gift_product_id || "";
          setGiftRules({ 
            active: data.gift_active || false, 
            threshold: data.gift_threshold || 0, 
            productId: currentGiftId 
          });
        }

        const deliveryRes = await databases.listDocuments(DATABASE_ID, "delivery_settings", [Query.limit(1)]).catch(() => null);
        if (deliveryRes && deliveryRes.documents.length > 0) {
          setDeliverySettings(deliveryRes.documents[0] as any);
        }

        const productRows = cart.filter((item) => {
          const baseId = getBaseProductId(String(item.product_id || ""));
          return baseId && baseId !== "gift_box" && baseId !== "gift_bag";
        });
        const ids = Array.from(new Set(productRows.map((item) => getBaseProductId(String(item.product_id || "")))));
        let fullData: ProductDetail[] = [];
          
        if (ids.length > 0) {
          const res = await databases.listDocuments(DATABASE_ID, 'products', [Query.equal('$id', ids)]);
          const docById = new Map<string, any>();
          res.documents.forEach((doc: any) => docById.set(doc.$id, doc));
          fullData = productRows.map((cartRow) => {
            const cartProductId = String(cartRow.product_id || "");
            const baseId = getBaseProductId(cartProductId);
            const doc = docById.get(baseId);
            if (!doc) {
              return {
                $id: baseId,
                cartProductId,
                name: "Produit indisponible",
                price: 0,
                image_url: "/img/placeholder.jpg",
                quantity: Number(cartRow.quantity || 1),
                format: "",
                isGift: baseId === currentGiftId
              };
            }
            const isAlt = isAltVariantProductId(cartProductId);
            const hasAlt = Boolean(String(doc.format_alt || "").trim()) && Number(doc.price_alt || 0) > 0;
            const useAlt = isAlt && hasAlt;
            return {
              $id: doc.$id,
              cartProductId,
              name: doc.name,
              price: Number(useAlt ? doc.price_alt : doc.price),
              image_url: doc.image_url,
              quantity: Number(cartRow.quantity || 1),
              format: String(useAlt ? doc.format_alt : doc.format || ""),
              isGift: doc.$id === currentGiftId
            };
          });
        }

        // Añadir regalo visualmente si existe en carrito
        if (currentGiftId && cart.some(c => getBaseProductId(String(c.product_id || "")) === currentGiftId)) {
          try {
            const giftProd = await databases.getDocument(DATABASE_ID, 'gift_inventory', currentGiftId);
            fullData.push({
              $id: giftProd.$id,
              cartProductId: giftProd.$id,
              name: giftProd.name,
              price: 0,
              quantity: 1,
              image_url: giftProd.image_url,
              format: "",
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
                cartProductId: giftProd.$id,
                name: giftProd.name,
                price: 0,
                quantity: 1,
                image_url: giftProd.image_url,
                format: "",
                isGift: true
              } as any);
            } catch (e) {}
          }
        }
        setProducts(fullData);
      } catch (err) {
        console.error("Checkout init error:", err);
      } finally {
        setLoading(false);
      }
    }
    initCheckout();
  }, [cart]);

  const productsTotal = products.reduce((sum, p) => sum + (p.isGift ? 0 : p.price * p.quantity), 0);
  const boxInCart = cart.find(item => item.product_id === "gift_box");
  const bagInCart = cart.find(item => item.product_id === "gift_bag");
  const packagingTotal = (boxInCart ? (packagingInfo?.box_price * boxInCart.quantity || 0) : 0) + 
                         (bagInCart ? (packagingInfo?.bag_price * bagInCart.quantity || 0) : 0);
  const totalFinal = Math.max(0, productsTotal + packagingTotal - discountTotal);
  const shippingFee = totalFinal > 0 && totalFinal < 500 ? 35 : 0;
  const shippingLabel = shippingFee === 0 ? "Gratuite" : `${shippingFee.toFixed(2)} MAD`;

  const calcEligibleSubtotal = (coupon: any) => {
    const productIdsEligible: string[] = Array.isArray(coupon.applicable_product_ids) ? coupon.applicable_product_ids : [];
    const tagsEligible: string[] = Array.isArray(coupon.applicable_tags) ? coupon.applicable_tags : [];
    const base = products.filter(p => !p.isGift);
    if (productIdsEligible.length > 0) {
      return base
        .filter(p => productIdsEligible.includes(p.$id))
        .reduce((sum, p) => sum + p.price * p.quantity, 0);
    }
    if (tagsEligible.length > 0) {
      return base
        .filter(p => {
          const anyTag = (p as any).tags && Array.isArray((p as any).tags) 
            ? tagsEligible.some(t => (p as any).tags.includes(t)) 
            : true;
          return anyTag;
        })
        .reduce((sum, p) => sum + p.price * p.quantity, 0);
    }
    return base.reduce((sum, p) => sum + p.price * p.quantity, 0);
  };

  const applyCoupon = async () => {
    setCouponApplying(true);
    setCouponError(null);
    setDiscountTotal(0);
    setAppliedCoupon(null);
    try {
      const code = couponInput.trim().toUpperCase();
      if (!code) { setCouponError("Veuillez saisir un code."); return; }
      const nowIso = new Date().toISOString();
      const res = await databases.listDocuments(DATABASE_ID, 'coupons', [
        Query.equal('code', code),
        Query.equal('is_active', true),
        Query.lessThanEqual('start_at', nowIso),
        Query.greaterThanEqual('end_at', nowIso),
        Query.limit(1)
      ]);
      if (res.documents.length === 0) { setCouponError("Code invalide ou expiré."); return; }
      const coupon: any = res.documents[0];

      if (productsTotal < (coupon.min_order_total || 0)) {
        setCouponError("Montant minimum non atteint."); return;
      }
      if (userId) {
        if (coupon.first_order_only) {
          const prev = await databases.listDocuments(DATABASE_ID, 'orders', [Query.equal('user_id', userId), Query.limit(1)]);
          if (prev.total > 0) { setCouponError("Réservé au premier achat."); return; }
        }
        const globalUsage = await databases.listDocuments(DATABASE_ID, 'coupon_usages', [Query.equal('coupon_id', coupon.$id)]);
        if ((coupon.max_usage_global || 0) > 0 && globalUsage.total >= coupon.max_usage_global) {
          setCouponError("Limite globale atteinte."); return;
        }
        const userUsage = await databases.listDocuments(DATABASE_ID, 'coupon_usages', [Query.equal('coupon_id', coupon.$id), Query.equal('user_id', userId)]);
        if ((coupon.per_user_limit || 0) > 0 && userUsage.total >= coupon.per_user_limit) {
          setCouponError("Limite par utilisateur atteinte."); return;
        }
      }

      const eligibleSubtotal = calcEligibleSubtotal(coupon);
      if (eligibleSubtotal <= 0) { setCouponError("Aucun article éligible pour ce code."); return; }
      let discount = 0;
      if (coupon.type === 'percentage') discount = eligibleSubtotal * (coupon.amount / 100);
      else discount = Math.min(coupon.amount, eligibleSubtotal);
      if (discount <= 0) { setCouponError("Remise non applicable."); return; }

      setAppliedCoupon(coupon);
      setDiscountTotal(discount);
    } catch (err) {
      setCouponError("Erreur lors de l'application.");
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || products.length === 0) return;
    setOrderLoading(true);

    try {
      let itemsArray = products.map(p => `${p.quantity}x ${p.name}${p.format ? ` (${p.format})` : ""}${p.isGift ? ' (OFFERT)' : ''}`);
      if (boxInCart) itemsArray.push(`${boxInCart.quantity}x Coffret Cadeau`);
      if (bagInCart) itemsArray.push(`${bagInCart.quantity}x Pochette Cadeau`);
      
      const itemsSummary = itemsArray.join(", ");
      const orderItems: OrderItemRow[] = [
        ...products.map((p) => ({
          product_id: p.$id,
          cart_product_id: p.cartProductId,
          format: p.format || "",
          quantity: p.quantity,
          isGift: Boolean(p.isGift),
          item_type: "product" as const,
        })),
        ...(boxInCart ? [{
          product_id: "gift_box",
          quantity: boxInCart.quantity,
          isGift: false,
          item_type: "packaging" as const,
        }] : []),
        ...(bagInCart ? [{
          product_id: "gift_bag",
          quantity: bagInCart.quantity,
          isGift: false,
          item_type: "packaging" as const,
        }] : []),
      ];
      const orderDoc = await databases.createDocument(DATABASE_ID, 'orders', ID.unique(), {
        user_id: userId, items: itemsSummary, total: totalFinal,
        shipping_address: `${address}, ${city}`, status: "en attente", gift_message: savedGiftMessage,
        coupon_code: appliedCoupon ? appliedCoupon.code : "",
        discount_total: discountTotal,
        subtotal_before_discount: productsTotal,
        items_json: JSON.stringify(orderItems),
        stock_deducted: false,
        stock_deducted_at: null
      });

      if (appliedCoupon && userId) {
        try {
          await databases.createDocument(DATABASE_ID, 'coupon_usages', ID.unique(), {
            coupon_id: appliedCoupon.$id,
            user_id: userId,
            order_id: orderDoc.$id,
            used_at: new Date().toISOString()
          });
        } catch (usageErr) {
          console.warn("Coupon usage logging failed:", usageErr);
        }
      }

      window.open(`https://wa.me/212639083315?text=${encodeURIComponent(
        `Nouvelle commande de ${fullName}` +
        `\nArticles: ${itemsSummary}` +
        (appliedCoupon ? `\nCoupon: ${appliedCoupon.code} (-${discountTotal.toFixed(2)} MAD)` : ``) +
        `\nSous-total: ${productsTotal.toFixed(2)} MAD` +
        `\nTotal: ${totalFinal.toFixed(2)} MAD` +
        (savedGiftMessage ? `\nMessage: ${savedGiftMessage}` : ``)
      )}`, '_blank');
      await Promise.all(cart.map(item => databases.deleteDocument(DATABASE_ID, 'cart', item.$id!)));
      clearCart();
      localStorage.removeItem("skineno_gift_message");
      router.push("/merci");
    } catch (err) { 
      console.error("Erreur lors de la confirmation de commande:", err);
      alert("Erreur."); 
    } finally { setOrderLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <h2 className="text-3xl font-serif">Finaliser la commande</h2>
          {!userId ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-5">
              <p className="text-sm">Vous pouvez ajouter des produits au panier sans compte, mais vous devez vous connecter pour finaliser la commande.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/login" className="border border-black rounded-full py-3 text-center text-xs font-bold uppercase tracking-widest">Se connecter</Link>
                <Link href="/register" className="bg-black text-white rounded-full py-3 text-center text-xs font-bold uppercase tracking-widest">Créer un compte</Link>
              </div>
            </div>
          ) : (
            <form id="orderForm" onSubmit={handlePlaceOrder} className="space-y-8">
              <input type="text" placeholder="Nom Complet" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border-b p-3 outline-none" required />
              <input type="text" placeholder="Adresse" value={address} onChange={e => setAddress(e.target.value)} className="w-full border-b p-3 outline-none" required />
              <div className="grid grid-cols-2 gap-6">
                <input type="text" placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} className="w-full border-b p-3 outline-none" required />
                <input type="tel" placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border-b p-3 outline-none" required />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Mode d’expédition</h3>
                <div className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm">Livraison Standard</span>
                  <span className={`text-sm font-bold ${shippingFee === 0 ? "text-green-600" : "text-black"}`}>{shippingLabel}</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Paiement</h3>
                <p className="text-sm text-gray-500">Toutes les transactions sont sécurisées et chiffrées.</p>
                <label className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <span className="text-sm font-medium">Paiement à la livraison</span>
                </label>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 h-fit sticky top-24">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-8 border-b pb-4">Résumé</h3>
          <div className="space-y-4 mb-10">
            {products.map(p => (
              <div key={`${p.cartProductId}-${p.$id}`} className={`flex justify-between items-center text-sm ${p.isGift ? 'text-amber-600 font-bold' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <img src={p.image_url} className="w-10 h-10 rounded object-cover" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">{p.quantity}</span>
                  </div>
                  <div>
                    <span>{p.name} {p.isGift && "🎁"}</span>
                    {p.format && !p.isGift && <p className="text-xs text-gray-500 uppercase mt-0.5">{p.format}</p>}
                  </div>
                </div>
                <span>{p.isGift ? "OFFERT" : `${(p.price * p.quantity).toFixed(2)} MAD`}</span>
              </div>
            ))}
            {boxInCart && packagingInfo && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <img src={packagingInfo.box_image} className="w-10 h-10 rounded object-cover" alt="Coffret cadeau" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">{boxInCart.quantity}</span>
                  </div>
                  <div>
                    <p>Coffret cadeau</p>
                    <p className="text-xs text-gray-500">{boxSize}</p>
                  </div>
                </div>
                <span>{(packagingInfo.box_price * boxInCart.quantity).toFixed(2)} MAD</span>
              </div>
            )}
            {bagInCart && packagingInfo && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                    <img src={packagingInfo.bag_image} className="w-10 h-10 rounded object-cover" alt="Sac cadeau" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">{bagInCart.quantity}</span>
                  </div>
                  <div>
                    <p>Sac cadeau</p>
                    <p className="text-xs text-gray-500">{bagSize}</p>
                  </div>
                </div>
                <span>{(packagingInfo.bag_price * bagInCart.quantity).toFixed(2)} MAD</span>
              </div>
            )}
            {savedGiftMessage && <div className="pt-2 italic text-xs text-gray-500 border-l-2 border-amber-300 pl-2">"{savedGiftMessage}"</div>}
            <div className="pt-6 space-y-3">
              <div className="flex gap-2 items-stretch">
                <div className="min-w-0 flex-1">
                  <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Code promo" className="w-full border p-3 rounded text-sm outline-none" />
                </div>
                <button type="button" onClick={applyCoupon} disabled={couponApplying} className="shrink-0 px-4 py-3 rounded bg-black text-white text-xs font-bold uppercase hover:bg-[#B29071] transition">
                  {couponApplying ? "..." : "Appliquer"}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex justify-between text-xs">
                  <span>Coupon {appliedCoupon.code}</span>
                  <span className="font-bold text-green-600">- {discountTotal.toFixed(2)} MAD</span>
                </div>
              )}
            </div>
            <div className="pt-4 border-t flex justify-between text-2xl font-serif"><span>Total</span><span className="text-[#B29071]">{totalFinal.toFixed(2)} MAD</span></div>
          </div>
          <button type="submit" form="orderForm" disabled={orderLoading || !userId} className="w-full bg-black text-white py-6 rounded-full font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all disabled:opacity-50">
            {orderLoading ? <Loader2 className="animate-spin mx-auto"/> : userId ? "Confirmer la commande" : "Connectez-vous pour continuer"}
          </button>
        </div>
      </div>
      <div className="pt-8 mt-8 border-t border-gray-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
        <button type="button" className="underline text-gray-400 cursor-not-allowed">Politique de remboursement</button>
        <button type="button" onClick={() => setActivePolicyModal("shipping")} className="underline">Expédition</button>
        <button type="button" className="underline text-gray-400 cursor-not-allowed">Conditions d’utilisation</button>
        <button type="button" className="underline text-gray-400 cursor-not-allowed">Conditions générales de vente</button>
        <button type="button" className="underline text-gray-400 cursor-not-allowed">Mentions légales</button>
      </div>
      {activePolicyModal === "shipping" && (
        <div className="fixed inset-0 z-[140] bg-black/45 flex items-center justify-center px-4" onClick={() => setActivePolicyModal(null)}>
          <div className="w-full max-w-2xl bg-white rounded-3xl p-7 md:p-9 shadow-2xl relative max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-xl border border-black flex items-center justify-center text-xl leading-none"
            >
              ×
            </button>
            <h3 className="text-3xl font-bold mb-6">{deliverySettings?.panel_title || "Expédition"}</h3>
            <div className="space-y-5 text-[18px] leading-relaxed">
              {deliverySettings?.section_1_title && <h4 className="font-bold text-2xl">{deliverySettings.section_1_title}</h4>}
              {deliverySettings?.section_1_content && <p>{deliverySettings.section_1_content}</p>}
              {deliverySettings?.section_2_title && <h4 className="font-bold text-2xl">{deliverySettings.section_2_title}</h4>}
              {deliverySettings?.section_2_content_html && (
                <div dangerouslySetInnerHTML={{ __html: deliverySettings.section_2_content_html }} />
              )}
              {deliverySettings?.notes_html && (
                <div dangerouslySetInnerHTML={{ __html: deliverySettings.notes_html }} />
              )}
              {!deliverySettings && (
                <p>
                  Information d’expédition en préparation. Contact: <a href="mailto:contact@skinino.com" className="underline">contact@skinino.com</a>
                </p>
              )}
              <p className="text-base text-gray-500">Skinino · <a href="mailto:contact@skinino.com" className="underline">contact@skinino.com</a></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
