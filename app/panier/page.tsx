"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/CartContext"; 
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { Trash2, ShoppingBag, ArrowRight, Loader2, Minus, Plus, ChevronLeft, ChevronRight, Check, Gift, Package, Sparkles, X } from "lucide-react";
import Link from "next/link";

interface FullProduct {
  $id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number; 
  format: string; 
  cartDocId: string; 
}

export default function PanierPage() {
  const { cart, removeFromCart, addToCart } = useCart();
  const [products, setProducts] = useState<FullProduct[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any>(null); 
  const [giftRules, setGiftRules] = useState({ active: false, threshold: 0, name: "", productId: "" });
  const [giftProduct, setGiftProduct] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // --- ESTADOS PARA UI ---
  const [isPackagingOpen, setIsPackagingOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [boxSize, setBoxSize] = useState("Moyen");
  const [bagSize, setBagSize] = useState("Petit");
  const [msgStatus, setMsgStatus] = useState(false); 

  useEffect(() => {
    async function loadAllData() {
      try {
        const pkgRes = await databases.listDocuments(DATABASE_ID, "packaging_settings", [Query.limit(1)]);
        let currentGiftId = "";
        if (pkgRes.documents.length > 0) {
          const data: any = pkgRes.documents[0];
          setPackaging(data);
          currentGiftId = data.gift_product_id || "";
          setGiftRules({ 
            active: data.gift_active || false, 
            threshold: data.gift_threshold || 0, 
            name: data.gift_name || "Cadeau",
            productId: currentGiftId
          });

          if (currentGiftId) {
            try {
              const gProd = await databases.getDocument(DATABASE_ID, 'products', currentGiftId);
              setGiftProduct(gProd);
            } catch (e) { console.error("Gift product not found"); }
          }
        }

        const ids = cart.map((item) => item.product_id).filter(id => id && id.length > 5 && id !== "gift_box" && id !== "gift_bag");

        if (ids.length > 0) {
          const response = await databases.listDocuments(DATABASE_ID, "products", [Query.equal("$id", ids)]);
          const fullData = response.documents.map((doc: any) => {
            const cartInfo = cart.find((c) => c.product_id === doc.$id);
            return {
              $id: doc.$id,
              name: doc.name,
              price: doc.price,
              image_url: doc.image_url,
              quantity: cartInfo?.quantity || 1,
              stock: doc.stock || 0, 
              format: doc.format || "", 
              cartDocId: cartInfo?.$id || "" 
            };
          });
          setProducts(fullData);
        } else { setProducts([]); }

        const suggestRes = await databases.listDocuments(DATABASE_ID, "products", [Query.equal("is_suggested", true), Query.limit(6)]);
        setSuggestedProducts(suggestRes.documents.filter(d => !ids.includes(d.$id)).slice(0, 4));

        const sampleRes = await databases.listDocuments(DATABASE_ID, "products", [Query.equal("is_sample", true), Query.limit(8)]);
        setSamples(sampleRes.documents);

        // Recuperar mensaje si ya existía
        const savedMsg = localStorage.getItem("skineno_gift_message");
        if (savedMsg) setGiftMessage(savedMsg);

      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    loadAllData();
  }, [cart]);

  useEffect(() => {
    if (!loading && products.length === 0 && cart.length > 0) {
      const onlyPackagingOrGift = cart.every(item => 
        item.product_id === "gift_box" || 
        item.product_id === "gift_bag" || 
        item.product_id === giftRules.productId
      );
      if (onlyPackagingOrGift) {
        cart.forEach(item => removeFromCart(item.$id!));
        localStorage.removeItem("skineno_gift_message");
      }
    }
  }, [products.length, loading]);

  const handleQtyChange = async (productId: string, delta: number) => {
    const product = products.find(p => p.$id === productId);
    const pkgItem = cart.find(item => item.product_id === productId);
    const currentQty = product ? product.quantity : (pkgItem ? pkgItem.quantity : 0);
    const currentDocId = product ? product.cartDocId : (pkgItem ? pkgItem.$id : "");
    if (!currentDocId) return;
    if (productId === giftRules.productId) return; 
    if (delta === -1 && currentQty === 1) { await removeFromCart(currentDocId); return; }
    const stockLimit = product ? product.stock : 99;
    if (delta === 1 && currentQty >= stockLimit) return;
    setUpdatingId(productId);
    try { await addToCart(productId, delta); } finally { setUpdatingId(null); }
  };

  const handleSaveMessage = () => {
    if (!giftMessage.trim()) return;
    localStorage.setItem("skineno_gift_message", giftMessage);
    setMsgStatus(true);
    setTimeout(() => setMsgStatus(false), 2000);
  };

  const productsTotal = products.reduce((sum, p) => sum + (p.$id === giftRules.productId ? 0 : p.price * p.quantity), 0);
  const boxInCart = cart.find(item => item.product_id === "gift_box");
  const bagInCart = cart.find(item => item.product_id === "gift_bag");
  const packagingTotal = (boxInCart ? (packaging?.box_price * boxInCart.quantity || 0) : 0) + (bagInCart ? (packaging?.bag_price * bagInCart.quantity || 0) : 0);
  const totalFinal = productsTotal + packagingTotal;

  const remainingForGift = Math.max(0, giftRules.threshold - productsTotal);
  const progressPercent = giftRules.threshold > 0 ? Math.min(100, (productsTotal / giftRules.threshold) * 100) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-[#B29071]" /></div>;

  if (products.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="absolute top-10 left-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">VOTRE PANIER <span className="text-gray-400">0 PRODUITS</span></div>
      <h2 className="text-5xl font-serif mb-4 tracking-tighter uppercase">Votre panier est vide</h2>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-12">Commencez votre shopping et explorez nos soins.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
        <Link href="/boutique/Visage" className="border border-black rounded-full py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Soins Visage</Link>
        <Link href="/boutique/Cheveux" className="border border-black rounded-full py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Soins Cheveux</Link>
        <Link href="/boutique/Corps" className="border border-black rounded-full py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Soins du Corps</Link>
        <Link href="/boutique/Cactea" className="border border-black rounded-full py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Cactéa</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 text-black font-sans">
      {giftRules.active && (
        <div className="max-w-2xl mx-auto mb-16 text-center space-y-3">
          <p className="text-[13px] font-medium">
            {remainingForGift > 0 
              ? <>Complétez pour l'offre <strong>{giftRules.name}</strong> offert ✨ <strong>{remainingForGift.toFixed(2)} MAD</strong> restant</>
              : <>Félicitations ! Votre <strong>{giftRules.name}</strong> est offert ! 🎁</>
            }
          </p>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#B29071] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <aside className="hidden lg:block lg:col-span-2 space-y-8">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] border-b pb-4 text-gray-400 text-center">Routine</h2>
          <div className="space-y-8">
            {suggestedProducts.map((sp) => (
              <div key={sp.$id} className="group text-center space-y-2">
                <div className="relative w-16 h-20 mx-auto bg-gray-50 rounded-lg overflow-hidden"><img src={sp.image_url} alt={sp.name} className="w-full h-full object-cover" /></div>
                <h4 className="text-[9px] font-bold uppercase truncate px-1">{sp.name}</h4>
                <button onClick={() => addToCart(sp.$id, 1)} className="text-[8px] font-bold uppercase underline mt-1 hover:text-[#B29071]">Ajouter</button>
              </div>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-7 space-y-10">
          <h1 className="text-xl font-serif uppercase tracking-widest border-b pb-6">Votre Panier</h1>
          {giftRules.active && productsTotal >= giftRules.threshold && giftProduct && (
            <div className="mb-10 animate-fade-in">
              <div className="bg-amber-50/40 border border-amber-200/50 rounded-[2rem] p-6 flex gap-6 items-center shadow-sm relative overflow-hidden">
                <img src={giftProduct.image_url} className="w-20 h-24 object-cover rounded-xl bg-white shadow-sm" alt="Gift" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div><span className="text-[8px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Offre Débloquée</span><h3 className="font-bold text-sm uppercase tracking-wider mt-2">{giftProduct.name}</h3></div>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-tighter">Offert</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {products.filter(p => p.$id !== giftRules.productId).map((p) => (
              <div key={p.$id} className="py-6 flex gap-6 items-start">
                <img src={p.image_url} className="w-20 h-28 object-cover rounded-lg bg-gray-50" alt={p.name} />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider">{p.name}</h3>
                    <p className="font-bold text-sm">{p.price.toFixed(2)} MAD</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-white">
                      <button onClick={() => handleQtyChange(p.$id, -1)} className="p-1 hover:text-[#B29071] transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-bold">{updatingId === p.$id ? '...' : p.quantity}</span>
                      <button onClick={() => handleQtyChange(p.$id, 1)} disabled={p.quantity >= p.stock} className="p-1 hover:text-[#B29071] transition-colors disabled:opacity-20"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(p.cartDocId)} className="text-[9px] uppercase font-bold underline hover:text-red-500">Supprimer</button>
                  </div>
                </div>
              </div>
            ))}
            {boxInCart && packaging && (
              <div className="py-6 flex gap-6 items-start opacity-80">
                <img src={packaging.box_image} className="w-16 h-20 object-contain" alt="Box" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between"><p className="text-[10px] font-bold uppercase">Coffret Cadeau ({boxSize})</p><p className="text-sm font-bold">{(packaging.box_price * boxInCart.quantity).toFixed(2)} MAD</p></div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-white">
                      <button onClick={() => handleQtyChange("gift_box", -1)} className="p-1 hover:text-[#B29071]"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-bold">{boxInCart.quantity}</span>
                      <button onClick={() => handleQtyChange("gift_box", 1)} className="p-1 hover:text-[#B29071]"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(boxInCart.$id!)} className="text-[9px] uppercase font-bold underline hover:text-red-500">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
            {bagInCart && packaging && (
              <div className="py-6 flex gap-6 items-start opacity-80">
                <img src={packaging.bag_image} className="w-16 h-20 object-contain" alt="Bag" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between"><p className="text-[10px] font-bold uppercase">Sac Cadeau ({bagSize})</p><p className="text-sm font-bold">{(packaging.bag_price * bagInCart.quantity).toFixed(2)} MAD</p></div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-white">
                      <button onClick={() => handleQtyChange("gift_bag", -1)} className="p-1 hover:text-[#B29071]"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-bold">{bagInCart.quantity}</span>
                      <button onClick={() => handleQtyChange("gift_bag", 1)} className="p-1 hover:text-[#B29071]"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(bagInCart.$id!)} className="text-[9px] uppercase font-bold underline hover:text-red-500">Supprimer</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-10 space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Échantillons offerts</h2>
            <div className="grid grid-cols-4 gap-4">
              {samples.map((s) => {
                const isInCart = cart.some(item => item.product_id === s.$id);
                return (
                  <div key={s.$id} className="text-center space-y-2">
                    <img src={s.image_url} className="w-12 h-16 mx-auto object-cover rounded shadow-sm" alt={s.name} />
                    <button onClick={() => !isInCart && addToCart(s.$id, 1)} className={`text-[8px] font-bold uppercase underline ${isInCart ? 'text-green-600' : ''}`}>{isInCart ? "Ajouté" : "Ajouter"}</button>
                  </div>
                );
              })}
            </div>
          </div>

          {packaging && (packaging.box_active || packaging.bag_active) && (
            <div className="pt-10 border-t border-gray-100">
              <button onClick={() => setIsPackagingOpen(!isPackagingOpen)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-[#B29071] transition-colors">Ajouter un coffret cadeau {isPackagingOpen ? '-' : '+'}</button>
              {isPackagingOpen && (
                <div className="mt-8 space-y-10 animate-fade-in">
                  {packaging.box_active && (
                    <div className="flex items-center gap-6">
                      <img src={packaging.box_image} className="w-16 h-16 object-contain bg-gray-50 rounded-lg" alt="Box" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase tracking-wider">Coffret Cadeau</h4><span className="text-[10px] text-gray-400 font-bold">{packaging.box_price.toFixed(2)} MAD</span><button onClick={() => addToCart("gift_box", 1)} className="text-[10px] font-bold uppercase underline hover:text-[#B29071]">Ajouter</button></div>
                        <select value={boxSize} onChange={(e) => setBoxSize(e.target.value)} className="border border-gray-200 rounded-full px-4 py-1 text-[10px] bg-white outline-none cursor-pointer"><option value="Petit">Petit</option><option value="Moyen">Moyen</option><option value="Grand">Grand</option></select>
                      </div>
                    </div>
                  )}
                  {packaging.bag_active && (
                    <div className="flex items-center gap-6">
                      <img src={packaging.bag_image} className="w-16 h-16 object-contain bg-gray-50 rounded-lg" alt="Bag" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase tracking-wider">Sac Cadeau</h4><span className="text-[10px] text-gray-400 font-bold">{packaging.bag_price.toFixed(2)} MAD</span><button onClick={() => addToCart("gift_bag", 1)} className="text-[10px] font-bold uppercase underline hover:text-[#B29071]">Ajouter</button></div>
                        <select value={bagSize} onChange={(e) => setBagSize(e.target.value)} className="border border-gray-200 rounded-full px-4 py-1 text-[10px] bg-white outline-none cursor-pointer"><option value="Petit">Petit</option><option value="Moyen">Moyen</option><option value="Grand">Grand</option></select>
                      </div>
                    </div>
                  )}
                  <div className="pt-6">
                    <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Votre message" className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-[#B29071] transition-all resize-none bg-transparent" />
                    <div className="flex justify-end mt-4">
                      <button onClick={handleSaveMessage} className={`text-[10px] font-bold uppercase tracking-widest border border-gray-200 px-8 py-2.5 rounded-full transition-all ${msgStatus ? 'bg-green-600 text-white border-green-600' : 'hover:bg-black hover:text-white'}`}>{msgStatus ? <span className="flex items-center gap-2"><Check className="w-3 h-3"/> Validé</span> : "Valider"}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <aside className="lg:col-span-3 space-y-6 sticky top-32">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b pb-4">Résumé</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs"><span>Sous-total</span><span className="font-bold">{productsTotal.toFixed(2)} MAD</span></div>
              <div className="flex justify-between text-xs"><span>Packaging</span><span className="font-bold">{packagingTotal.toFixed(2)} MAD</span></div>
              <div className="flex justify-between text-xs"><span>Livraison</span><span className="text-green-600 font-bold uppercase text-[9px] tracking-widest bg-green-50 px-2 py-1 rounded">Gratuite</span></div>
              <div className="pt-4 border-t flex justify-between items-end"><span className="font-serif text-lg uppercase">Total</span><p className="text-xl font-bold text-[#B29071]">{totalFinal.toFixed(2)} MAD</p></div>
            </div>
            <Link href="/checkout" className="w-full bg-black text-white py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all flex items-center justify-center gap-2 shadow-xl">Finaliser <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}