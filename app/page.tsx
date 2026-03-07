"use client";

import { useEffect, useRef, useState } from "react";
// Importamos la configuración de Appwrite
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { ChevronLeft, ChevronRight, Loader2, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";

interface Product { id: string; name: string; price: number; image_url: string; format?: string; }
interface Slide { $id: string; title: string; subtitle: string; description: string; image1_url: string; image2_url: string; product_id: string | null; }

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const mobileProductsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // En Appwrite usamos listDocuments con Queries
        const [slidesRes, productsRes] = await Promise.all([
          databases.listDocuments(DATABASE_ID, 'hero_slides', [Query.orderAsc('$createdAt')]),
          databases.listDocuments(DATABASE_ID, 'products', [Query.orderDesc('$createdAt'), Query.limit(3)])
        ]);

        if (isMounted) {
          setSlides(slidesRes.documents as unknown as Slide[]);
          // Mapeamos los productos para normalizar el ID
          const formattedProducts = productsRes.documents.map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            price: doc.price,
            image_url: doc.image_url,
            format: doc.format || "",
          }));
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const nextSlide = () => { if (slides.length > 0) setCurrentSlide((prev) => (prev + 1) % slides.length); };
  const prevSlide = () => { if (slides.length > 0) setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1)); };
  const scrollMobileProducts = (direction: "left" | "right") => {
    if (!mobileProductsRef.current) return;
    mobileProductsRef.current.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  };

  // Auto-play del slider
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(interval);
  }, [slides]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#B29071] mb-4" />
        <p className="text-[10px] uppercase tracking-widest">Chargement de l'univers Skineno...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* SECCIÓN HERO - 3 COLUMNAS */}
      <section className="flex flex-col lg:flex-row w-full h-auto lg:h-[650px] overflow-hidden bg-[#FDFBF7]">
        
        {/* BLOQUE 1: TEXTO (34%) */}
        <div className="order-2 lg:order-1 w-full lg:w-[34%] bg-[#BCAAA4] flex flex-col justify-center px-8 lg:px-20 relative text-white py-12 lg:py-0 transition-colors duration-1000">
          <button onClick={prevSlide} className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 rounded-full items-center justify-center hover:bg-white hover:text-[#BCAAA4] transition-all z-20">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="z-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-serif mb-4 leading-tight uppercase transition-all duration-700">
              {slides[currentSlide]?.title || "SKINENO"}
            </h2>
            <h3 className="text-sm font-bold mb-6 font-sans tracking-[0.2em] opacity-90 uppercase">
              {slides[currentSlide]?.subtitle}
            </h3>
            <p className="text-xs md:text-sm font-light leading-relaxed mb-10 text-white/80">
              {slides[currentSlide]?.description}
            </p>
            {slides[currentSlide]?.product_id && (
              <Link href={`/produit/${slides[currentSlide].product_id}`} className="inline-block px-10 py-3 border border-white rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-[#BCAAA4] transition-all">
                DÉCOUVRIR
              </Link>
            )}
            
            <div className="flex gap-2 mt-12 justify-center lg:justify-start">
              {slides.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentSlide(index)} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-white scale-125" : "border border-white/50"}`} 
                />
              ))}
            </div>
          </div>
          
          <button onClick={nextSlide} className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 rounded-full items-center justify-center hover:bg-white hover:text-[#BCAAA4] transition-all z-20">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* BLOQUE 2: IMAGEN CENTRAL (33%) */}
        <div className="order-1 lg:order-2 w-full lg:w-[33%] h-[520px] lg:h-full relative bg-gray-100 lg:border-r border-white/10 overflow-hidden">
          <img 
            key={`img1-${currentSlide}`}
            src={slides[currentSlide]?.image1_url || "/img/placeholder.jpg"} 
            className="w-full h-full object-cover animate-fade-in duration-1000" 
            alt="Skineno Concept" 
          />
        </div>

        {/* BLOQUE 3: IMAGEN DERECHA (33%) */}
        <div className="hidden lg:block lg:order-3 w-full lg:w-[33%] h-full relative bg-gray-100 overflow-hidden">
          <img 
            key={`img2-${currentSlide}`}
            src={slides[currentSlide]?.image2_url || "/img/placeholder-2.jpg"} 
            className="w-full h-full object-cover animate-fade-in duration-1000" 
            alt="Skineno Ritual" 
          />
        </div>

      </section>

      {/* PRODUCTOS ICONICOS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-serif uppercase tracking-[0.1em] text-black mb-4">NOS ICONIQUES</h3>
          <p className="text-xs text-gray-500 font-sans tracking-widest font-light">Découvrez nos rituels de soin les plus précieux.</p>
        </div>

        <div className="md:hidden -mx-6 px-6 overflow-x-auto">
          <div ref={mobileProductsRef} className="flex gap-5 snap-x snap-mandatory pb-2 overflow-x-auto">
            {products.map((item, index) => (
              <div key={item.id} className="snap-start shrink-0 w-[82vw] flex flex-col text-left">
                <Link href={`/produit/${item.id}`} className="block">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black mb-3 block">Meilleure Vente</span>
                  <div className="w-full aspect-[4/5] overflow-hidden bg-[#FAFAFA] mb-5 relative rounded-2xl shadow-sm">
                    <img
                      src={item.image_url || "/img/img1.jpg"}
                      className="w-full h-full object-cover object-center"
                      alt={item.name}
                    />
                    {products.length > 1 && index > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollMobileProducts("left");
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#C7B186] text-white flex items-center justify-center"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {products.length > 1 && index < products.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollMobileProducts("right");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#C7B186] text-white flex items-center justify-center"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </Link>
                <h4 className="text-3xl font-serif tracking-tight text-black uppercase leading-none">{item.name}</h4>
                <p className="text-[13px] text-black mt-1 uppercase tracking-wide">{item.format || "Soin Skineno"}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" className="w-10 h-10 rounded-full bg-[#C7B186] text-white flex items-center justify-center">
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </button>
                  <div>
                    <p className="text-[18px] leading-none font-bold text-black tracking-tight">{Number(item.price).toFixed(2)} DH</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-black" />
                      ))}
                      <span className="text-[12px] text-black ml-1">0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {products.map((item) => (
            <Link href={`/produit/${item.id}`} key={item.id} className="group cursor-pointer flex flex-col text-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black mb-4">Meilleure Vente</span>
              <div className="w-full aspect-[4/5] overflow-hidden bg-[#FAFAFA] mb-6 relative rounded-2xl shadow-sm">
                <img 
                  src={item.image_url || "/img/img1.jpg"} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-in-out" 
                  alt={item.name} 
                />
              </div>
              <h4 className="text-lg font-serif tracking-wide text-black">{item.name}</h4>
              <p className="text-xs text-[#B29071] mt-2 font-bold uppercase tracking-widest">
                {Number(item.price).toFixed(2)} MAD
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
