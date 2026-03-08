"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Loader2, Minus, Plus, ShoppingBag, ChevronRight, CheckCircle2, Heart, ChevronLeft, X, Gift, Truck, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { Query } from "appwrite";

const ALT_VARIANT_SUFFIX = "::alt";

interface Product {
  id: string;
  name: string; 
  price: number; 
  price_alt?: number;
  stock: number;
  stock_alt?: number;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  mini_title?: string;
  description_short?: string;
  description_long?: string;
  description: string; 
  format: string; 
  format_alt?: string;
  ingredients: string;
  ingredients_panel_title?: string;
  ingredients_panel_content?: string;
  rating?: number;
  reviews_count?: number;
}

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedNotify, setAddedNotify] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [packagingInfo, setPackagingInfo] = useState<any>(null);
  const [deliverySettings, setDeliverySettings] = useState<any>(null);
  const [deliveryRates, setDeliveryRates] = useState<any[]>([]);
  const [selectedFormatKey, setSelectedFormatKey] = useState<"primary" | "alt">("primary");
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const detailsTitleRef = useRef<HTMLHeadingElement | null>(null);
  const mainCtaRef = useRef<HTMLDivElement | null>(null);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);

  const hasAltVariant = Boolean((product?.format_alt || "").trim()) && Number(product?.price_alt || 0) > 0;
  const selectedPrice = selectedFormatKey === "alt" && hasAltVariant ? Number(product?.price_alt || 0) : Number(product?.price || 0);
  const selectedFormat = selectedFormatKey === "alt" && hasAltVariant ? String(product?.format_alt || "") : String(product?.format || "");
  const selectedCartProductId = product
    ? (selectedFormatKey === "alt" && hasAltVariant ? `${product.id}${ALT_VARIANT_SUFFIX}` : String(product.id))
    : "";
  const quantityInCart = (cart || []).reduce((sum: number, item: any) => (
    String(item.product_id || "") === selectedCartProductId
      ? sum + Number(item.quantity || 0)
      : sum
  ), 0);
  const stockTotal = selectedFormatKey === "alt" && hasAltVariant
    ? Number(product?.stock_alt || 0)
    : Number(product?.stock || 0);
  const availableToAdd = Math.max(0, stockTotal - quantityInCart);

  useEffect(() => {
    if (availableToAdd <= 0) {
      setQuantity(0);
    } else if (quantity > availableToAdd) {
      setQuantity(availableToAdd);
    } else if (quantity === 0 && availableToAdd > 0) {
      setQuantity(1);
    }
  }, [availableToAdd, quantity]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [doc, pkgRes, deliveryRes, ratesRes] = await Promise.all([
          databases.getDocument(DATABASE_ID, "products", id as string),
          databases.listDocuments(DATABASE_ID, "packaging_settings", [Query.limit(1)]),
          databases.listDocuments(DATABASE_ID, "delivery_settings", [Query.limit(1)]),
          databases.listDocuments(DATABASE_ID, "delivery_rates", [Query.orderAsc("sort_order"), Query.limit(200)]),
        ]);

        if (doc as any) {
          const productDoc = doc as any;
          setProduct({
            id: productDoc.$id,
            name: productDoc.name,
            price: Number(productDoc.price),
            price_alt: Number(productDoc.price_alt || 0),
            stock: Number(productDoc.stock || 0),
            stock_alt: Number(productDoc.stock_alt || 0),
            image_url: productDoc.image_url,
            image_url_2: productDoc.image_url_2 || "",
            image_url_3: productDoc.image_url_3 || "",
            image_url_4: productDoc.image_url_4 || "",
            mini_title: productDoc.mini_title || "",
            description_short: productDoc.description_short || "",
            description_long: productDoc.description_long || "",
            description: productDoc.description,
            format: productDoc.format,
            format_alt: productDoc.format_alt || "",
            ingredients: productDoc.ingredients,
            ingredients_panel_title: productDoc.ingredients_panel_title || "",
            ingredients_panel_content: productDoc.ingredients_panel_content || "",
            rating: Number(productDoc.rating || 0),
            reviews_count: Number(productDoc.reviews_count || 0)
          });
        }
        if (pkgRes.documents.length > 0) {
          setPackagingInfo(pkgRes.documents[0]);
        }
        if (deliveryRes.documents.length > 0) {
          setDeliverySettings(deliveryRes.documents[0]);
        } else {
          setDeliverySettings(null);
        }
        setDeliveryRates(ratesRes.documents.filter((r: any) => r.active !== false));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchData();
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [product.image_url, product.image_url_2, product.image_url_3, product.image_url_4].filter(Boolean) as string[];
  }, [product]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages]);

  useEffect(() => {
    if (!hasAltVariant && selectedFormatKey === "alt") {
      setSelectedFormatKey("primary");
    }
  }, [hasAltVariant, selectedFormatKey]);

  useEffect(() => {
    if (isIngredientsOpen || isDeliveryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isIngredientsOpen, isDeliveryOpen]);

  useEffect(() => {
    if (!mainCtaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainCtaVisible(entry.isIntersecting);
      },
      {
        threshold: 0.35,
        rootMargin: "-10% 0px -10% 0px",
      }
    );
    observer.observe(mainCtaRef.current);
    return () => observer.disconnect();
  }, [loading, product?.id]);

  const handleAddToCart = async () => {
    if (product && availableToAdd > 0 && quantity > 0 && selectedCartProductId) {
      try {
        await addToCart(selectedCartProductId, Number(quantity));
        setAddedNotify(true);
        setTimeout(() => setAddedNotify(false), 3000);
      } catch (error) {
        console.error("Error al añadir al carrito:", error);
      }
    }
  };

  const scrollToDetails = () => {
    if (!detailsTitleRef.current) return;
    const startY = window.scrollY;
    const targetY = detailsTitleRef.current.getBoundingClientRect().top + window.scrollY - 190;
    const distance = targetY - startY;
    const duration = 1600;
    let startTime: number | null = null;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };
  const starsCount = Math.max(0, Math.min(5, Math.round(Number(product?.rating || 0))));
  const shouldShowDelivery = deliverySettings ? deliverySettings.enabled !== false : packagingInfo?.delivery_panel_enabled !== false;
  const shouldShowStickyCta = !isMainCtaVisible && !isIngredientsOpen && !isDeliveryOpen;

  const openPrevImage = () => {
    if (galleryImages.length <= 1) return;
    const idx = galleryImages.findIndex((img) => img === activeImage);
    const prev = idx <= 0 ? galleryImages.length - 1 : idx - 1;
    setActiveImage(galleryImages[prev]);
  };

  const openNextImage = () => {
    if (galleryImages.length <= 1) return;
    const idx = galleryImages.findIndex((img) => img === activeImage);
    const next = idx >= galleryImages.length - 1 ? 0 : idx + 1;
    setActiveImage(galleryImages[next]);
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

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[58%_42%] gap-12">
        <div className="grid grid-cols-[64px_1fr] gap-4">
          <div className="space-y-3">
            {galleryImages.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-14 h-14 rounded-lg overflow-hidden border ${activeImage === img ? "border-black" : "border-gray-100"}`}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="bg-[#F9F9F9] rounded-2xl overflow-hidden aspect-[4/5] shadow-sm relative">
            <img 
              src={activeImage || product.image_url || "/img/placeholder.jpg"} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
            {galleryImages.length > 1 && (
              <>
                <button onClick={openPrevImage} type="button" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 border border-white flex items-center justify-center hover:bg-white transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={openNextImage} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 border border-white flex items-center justify-center hover:bg-white transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-3">
            {product.mini_title && (
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{product.mini_title}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className={`w-3.5 h-3.5 ${idx < starsCount ? "text-black fill-black" : "text-gray-200"}`} />
              ))}
              {!!product.reviews_count && <span className="text-[10px] text-gray-400 ml-1">{product.reviews_count}</span>}
            </div>
            <p className="text-[#B29071] font-bold text-xl tracking-widest pt-1">
              {selectedPrice.toFixed(2)} MAD
            </p>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  {selectedFormat && (
                    <p className="text-[12px] font-bold uppercase tracking-[0.16em]">Format: {selectedFormat}</p>
                  )}
                  {hasAltVariant && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedFormatKey("primary")}
                        className={`px-4 py-2 text-sm leading-none rounded-full border transition ${selectedFormatKey === "primary" ? "border-black bg-black text-white font-bold" : "border-gray-300 bg-white text-black"}`}
                      >
                        {product.format}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFormatKey("alt")}
                        className={`px-4 py-2 text-sm leading-none rounded-full border transition ${selectedFormatKey === "alt" ? "border-black bg-black text-white font-bold" : "border-gray-300 bg-white text-black"}`}
                      >
                        {product.format_alt}
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${stockTotal > 0 ? "text-green-700" : "text-red-600"}`}>
                    {stockTotal > 0 ? `En stock: ${stockTotal}` : "Rupture de stock"}
                  </p>
                  {quantityInCart > 0 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Dans le panier: {quantityInCart}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description_short || product.description}
              {(product.description_long || product.description) && (
                <button type="button" onClick={scrollToDetails} className="ml-2 underline text-black font-bold">Voir plus</button>
              )}
            </p>
          </div>

          <div className="space-y-0 border-t border-gray-100 pt-2">
            <button type="button" onClick={() => setIsIngredientsOpen(true)} className="w-full flex items-center justify-between text-left py-3 border-b border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ingrédients</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            {packagingInfo?.gift_active && (
              <div className="w-full flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-[#B29071]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Cadeau</p>
                    <p className="text-[11px] text-gray-600">Dès {Number(packagingInfo.gift_threshold || 0).toFixed(0)} Dhs · {packagingInfo.gift_name || "Offert"}</p>
                  </div>
                </div>
              </div>
            )}
            {shouldShowDelivery && (
              <button type="button" onClick={() => setIsDeliveryOpen(true)} className="w-full flex items-center justify-between text-left py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-[#B29071]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{packagingInfo?.delivery_badge_title || "Livraison offerte"}</p>
                    <p className="text-[11px] text-gray-500">{packagingInfo?.delivery_badge_subtitle || "À partir de 500 Dhs"}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div ref={mainCtaRef} className="pt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 w-fit bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="p-2 hover:text-[#B29071] transition-colors disabled:opacity-20"
                disabled={quantity <= 1 || availableToAdd <= 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="p-2 hover:text-[#B29071] transition-colors disabled:opacity-20"
                disabled={quantity >= availableToAdd} 
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart} 
              disabled={availableToAdd <= 0} 
              className={`flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${
                availableToAdd <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-black text-white hover:bg-[#B29071]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> 
              {stockTotal <= 0 
                ? "Rupture de stock" 
                : availableToAdd <= 0 
                  ? "Limite de stock atteinte" 
                  : "Ajouter au panier"}
            </button>

            <button 
              onClick={() => toggleWishlist({
                $id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url
              } as any)}
              className={`p-4 rounded-full border transition-all ${isInWishlist(product.id) ? "bg-[#B29071]/10 border-[#B29071] text-[#B29071]" : "border-gray-200 text-gray-400 hover:border-black hover:text-black"}`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </main>

      <section ref={detailsRef} className="max-w-7xl mx-auto px-6 pb-44 pt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 ref={detailsTitleRef} className="text-2xl font-serif mb-4 uppercase tracking-tight">Détails</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description_long || product.description || "—"}
          </p>
        </div>
        <div className="bg-[#F9F9F9] rounded-2xl overflow-hidden min-h-[300px]">
          <img
            src={product.image_url_2 || product.image_url_3 || product.image_url_4 || product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {shouldShowStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-[115] border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold truncate">{product.mini_title || "Produit"}</p>
              <p className="text-xs font-bold truncate">{product.name}</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:text-[#B29071] transition-colors disabled:opacity-20"
                disabled={quantity <= 1 || availableToAdd <= 0}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:text-[#B29071] transition-colors disabled:opacity-20"
                disabled={quantity >= availableToAdd}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={availableToAdd <= 0}
              className={`px-5 sm:px-7 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                availableToAdd <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-[#B29071]"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">
                {stockTotal <= 0 ? "Rupture de stock" : availableToAdd <= 0 ? "Limite atteinte" : "Ajouter au panier"}
              </span>
            </button>
          </div>
        </div>
      )}

      {isIngredientsOpen && (
        <div className="fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsIngredientsOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-xl font-serif">{product.ingredients_panel_title || "Ingrédients"}</h3>
              <button type="button" onClick={() => setIsIngredientsOpen(false)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {product.ingredients_panel_content || product.ingredients || "Aucune information."}
            </p>
          </div>
        </div>
      )}

      {isDeliveryOpen && (
        <div className="fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDeliveryOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h3 className="text-xl font-serif">{deliverySettings?.panel_title || packagingInfo?.delivery_panel_title || "Détail de la livraison"}</h3>
              <button type="button" onClick={() => setIsDeliveryOpen(false)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            {(deliverySettings?.section_1_title || deliverySettings?.section_1_content) && (
              <div className="mb-8">
                {deliverySettings?.section_1_title && <h4 className="text-lg font-semibold mb-2">{deliverySettings.section_1_title}</h4>}
                {deliverySettings?.section_1_content && <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{deliverySettings.section_1_content}</p>}
              </div>
            )}
            {(deliverySettings?.section_2_title || deliverySettings?.section_2_content_html) && (
              <div className="mb-8">
                {deliverySettings?.section_2_title && <h4 className="text-lg font-semibold mb-3">{deliverySettings.section_2_title}</h4>}
                {deliverySettings?.section_2_content_html && (
                  <div className="text-sm text-gray-700 leading-relaxed [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: deliverySettings.section_2_content_html }} />
                )}
              </div>
            )}
            {deliveryRates.length > 0 && (
              <div className="mb-8 overflow-x-auto">
                <h4 className="text-lg font-semibold mb-3">Tarifs de livraison</h4>
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-2 font-semibold">Zones</th>
                      <th className="py-2 font-semibold">Délais de livraison</th>
                      <th className="py-2 font-semibold">Frais de livraison</th>
                      <th className="py-2 font-semibold">Livraison offerte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryRates.map((rate: any) => (
                      <tr key={rate.$id} className="border-b border-gray-100">
                        <td className="py-2">{rate.zone}</td>
                        <td className="py-2">{rate.lead_time}</td>
                        <td className="py-2">{rate.shipping_fee}</td>
                        <td className="py-2">{rate.free_from}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {deliverySettings?.notes_html ? (
              <div className="text-sm text-gray-700 leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: deliverySettings.notes_html }} />
            ) : (
              !deliverySettings?.section_2_content_html && !deliveryRates.length && (
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {packagingInfo?.delivery_panel_content || "Aucune information."}
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
