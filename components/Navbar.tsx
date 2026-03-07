"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Heart, Menu, X, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { account, databases, DATABASE_ID, storage } from "@/appwriteConfig";
const BUCKET_ID_IMAGES = "6798e2270001090333d4"; 

import { Query } from "appwrite";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext"; 
import { useWishlist } from "@/lib/WishlistContext";
import { getStoreSettings } from "@/lib/data"; 

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart(); 
  const { wishlistCount } = useWishlist(); 
  
  const [menuText, setMenuText] = useState("SÉLECTION RAMADAN");
  const [menuActive, setMenuActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isSticky, setIsSticky] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const [megaMenuProducts, setMegaMenuProducts] = useState<{ [key: string]: any[] }>({
    "TOUS": [],
    "VISAGE": [],
    "CORPS": [],
    "CHEVEUX": [],
    "OFFRES": []
  });

  // ESTADO INICIAL CON CACHÉ O VALORES POR DEFECTO
  const [promoMessages, setPromoMessages] = useState<string[]>([]);

  // 1. EFECTO ULTRA-RÁPIDO PARA MENSAJES (Independiente de todo)
  useEffect(() => {
    // Intentar cargar desde caché local para aparición instantánea
    const cached = localStorage.getItem("skineno_promo_cache");
    if (cached) {
      setPromoMessages(JSON.parse(cached));
    }

    // Cargar desde Appwrite en segundo plano sin bloquear nada
    databases.listDocuments(DATABASE_ID, 'top_bar_messages', [
      Query.equal('active', true)
    ]).then(res => {
      if (res.documents.length > 0) {
        const msgs = res.documents.map((p: any) => p.text);
        setPromoMessages(msgs);
        // Guardar en caché para la próxima visita
        localStorage.setItem("skineno_promo_cache", JSON.stringify(msgs));
      }
    }).catch(err => console.error("Error rápido promos:", err));
  }, []);

  const getImageUrl = (fileId: string) => {
    if (!fileId) return "/img/placeholder.png";
    if (fileId.startsWith("http")) return fileId;
    return storage.getFileView(BUCKET_ID_IMAGES, fileId).toString();
  };

  useEffect(() => {
    async function fetchMegaMenuProducts() {
      try {
        const categories = ["Visage", "Corps", "Cheveux"];
        const newProducts: any = {};

        for (const cat of categories) {
          let queryField = "is_visage";
          if (cat === "Corps") queryField = "is_corps";
          if (cat === "Cheveux") queryField = "is_cheveux";

          const res = await databases.listDocuments(DATABASE_ID, 'products', [
            Query.equal(queryField, true),
            Query.limit(4)
          ]);
          newProducts[cat.toUpperCase()] = res.documents;
        }

        const resAll = await databases.listDocuments(DATABASE_ID, 'products', [Query.limit(4)]);
        newProducts["TOUS"] = resAll.documents;
        newProducts["OFFRES"] = resAll.documents;

        setMegaMenuProducts(newProducts);
      } catch (error) {
        console.error("Error fetching mega menu products:", error);
      }
    }
    fetchMegaMenuProducts();
  }, []);

  useEffect(() => {
    async function initNavbar() {
      try {
        const sessionUser = await account.get().catch(() => null);
        if (sessionUser) {
          setUser(sessionUser);
          try {
            const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', sessionUser.$id);
            const adminStatus = profile?.role === 'admin';
            setIsAdmin(adminStatus);
            localStorage.setItem('skineno_is_admin', String(adminStatus));
          } catch (profileErr) {
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          localStorage.removeItem('skineno_is_admin');
        }
      } catch (err) {
        setUser(null);
        setIsAdmin(false);
      }

      try {
        const storeConfig: any = await getStoreSettings();
        if (storeConfig) {
          setMenuText(storeConfig.dynamic_menu_text);
          setMenuActive(storeConfig.dynamic_menu_active);
        }
      } catch (err) {
        console.error("Error cargando configuración:", err);
      }
      setIsLoaded(true);
    }
    initNavbar();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) setIsSticky(true);
      else setIsSticky(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      localStorage.removeItem('skineno_is_admin');
      setUser(null);
      setIsAdmin(false);
      setIsMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMobileMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const MegaMenu = ({ category, products, displayTitle }: { category: string, products: any[], displayTitle: string }) => (
    <div 
      className={`absolute left-0 top-full w-full bg-[#fcfaf8] border-t border-gray-100 shadow-2xl transition-all duration-500 ease-in-out z-[100] overflow-hidden ${activeMegaMenu === category ? "max-h-[700px] opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"}`}
      onMouseEnter={() => setActiveMegaMenu(category)}
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      <div className="absolute -top-12 left-0 w-full h-12 bg-transparent" />

      <div className="max-w-[1400px] mx-auto flex p-10 gap-6">
        <div className="flex-1">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {products.map((prod, i) => {
                const isOutOfStock = prod.stock <= 0;
                return (
                  <Link 
                    key={i} 
                    href={`/produit/${prod.$id}`} 
                    onClick={() => setActiveMegaMenu(null)} 
                    className="bg-white p-5 rounded-2xl flex flex-col items-center text-center group cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative w-full aspect-square mb-4 overflow-hidden">
                      <img src={getImageUrl(prod.image || prod.image_url)} alt={prod.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    
                    {prod.rating && prod.rating > 0 ? (
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, starI) => (
                          <span key={starI} className={`text-[10px] ${starI < Math.round(prod.rating) ? "text-black" : "text-gray-300"}`}>★</span>
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">({prod.reviews_count || 0})</span>
                      </div>
                    ) : (
                      <div className="h-4 mb-2"></div> 
                    )}

                    <h4 className="text-[11px] font-bold uppercase mb-1 tracking-tight text-gray-900">{prod.name}</h4>
                    <p className="text-[10px] text-gray-500 mb-3 h-8 line-clamp-2">{prod.description || prod.desc}</p>
                    
                    <div className="relative flex items-center justify-between w-full mt-2 h-10 overflow-hidden group/cart">
                       <span className="text-[13px] font-bold transition-opacity duration-300 group-hover/cart:opacity-0">
                         {prod.price} MAD
                       </span>

                       <div className="absolute right-0 flex items-center justify-end w-full pointer-events-none">
                          <div className={`flex items-center justify-center rounded-full h-9 w-9 transition-all duration-500 ease-in-out group-hover/cart:w-full overflow-hidden pointer-events-auto ${isOutOfStock ? 'bg-gray-100 group-hover/cart:bg-gray-200' : 'bg-[#f3ece6] group-hover/cart:bg-black group-hover/cart:text-white'}`}>
                            <span className={`opacity-0 group-hover/cart:opacity-100 transition-opacity duration-300 whitespace-nowrap text-[9px] font-bold px-4 ${isOutOfStock ? 'text-gray-500' : ''}`}>
                              {isOutOfStock ? "RUPTURE DE STOCK" : "AJOUTER AU PANIER"}
                            </span>
                            <div className="min-w-[36px] flex items-center justify-center">
                              <ShoppingBag 
                                className={`w-4 h-4 ${isOutOfStock ? 'text-gray-300' : 'text-black group-hover/cart:text-white'} transition-colors duration-300`} 
                                strokeWidth={2.5} 
                              />
                            </div>
                          </div>
                       </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Search className="w-8 h-8 text-gray-200 mb-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Aucun produit disponible pour le moment</p>
            </div>
          )}
        </div>

        <div className="w-[300px] bg-white rounded-2xl flex flex-col items-center justify-center p-10 shadow-sm border border-gray-50">
          <h3 className="text-2xl font-medium uppercase tracking-[0.25em] mb-8 text-gray-800 text-center">{displayTitle}</h3>
          <Link 
            href={category === 'TOUS' ? '/boutique' : category === 'OFFRES' ? '/offres' : `/boutique/${category}`}
            onClick={() => setActiveMegaMenu(null)} 
            className="group flex items-center gap-3 border border-black rounded-full px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300"
          >
            TOUT VOIR <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className={`w-full bg-white font-sans z-[100] transition-all duration-300 ${isSticky ? "fixed top-0 shadow-md" : "relative"}`}>
        
        {/* BARRA SUPERIOR INMEDIATA: Siempre visible con fallback instantáneo */}
        <div className="bg-[#A48265] text-white text-[9px] md:text-[10px] py-2 overflow-hidden relative h-9 flex items-center">
          <div className="animate-marquee whitespace-nowrap">
            {((promoMessages && promoMessages.length > 0) ? promoMessages : [
              "Livraison gratuite à partir de 500 MAD",
              "Dès 1500 MAD : Cadeau offert"
            ]).map((msg, idx) => (
              <span key={idx} className="mx-32 uppercase tracking-[0.2em] font-bold">{msg}</span>
            ))}
            {((promoMessages && promoMessages.length > 0) ? promoMessages : [
              "Livraison gratuite à partir de 500 MAD",
              "Dès 1500 MAD : Cadeau offert"
            ]).map((msg, idx) => (
              <span key={`dup-${idx}`} className="mx-32 uppercase tracking-[0.2em] font-bold">{msg}</span>
            ))}
          </div>
        </div>

        <div className={`flex justify-between items-center px-6 md:px-10 border-b border-gray-100 transition-all ${isSticky ? "py-2" : "py-4"}`}>
          <div className="w-1/3 flex items-center gap-4">
            <button className="lg:hidden text-black" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:flex gap-6 items-center text-[11px] uppercase tracking-[0.15em] font-medium text-black">
              <div className="flex items-center gap-2 cursor-pointer hover:text-[#B29071] transition-colors">
                <Search className="w-4 h-4" /><span>Recherche</span>
              </div>
            </div>
          </div>

          <div className="w-1/3 flex justify-center">
            <Link href="/">
              <img src="/img/logo.png" alt="Logo Skineno" style={{ height: isSticky ? '45px' : '65px' }} className="object-contain transition-all duration-300" />
            </Link>
          </div>

          <div className="flex justify-end gap-4 md:gap-6 w-1/3 items-center text-[11px] uppercase font-medium text-black">
            {isAdmin && (
              <Link href="/admin" className="hidden lg:flex items-center gap-2 bg-[#B29071]/10 text-[#B29071] px-2.5 py-1 rounded-md border border-[#B29071]/20 font-bold hover:bg-[#B29071] hover:text-white transition-all">
                <ShieldCheck className="w-4 h-4" /> <span className="text-[9px]">PANEL ADMIN</span>
              </Link>
            )}
            
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/compte"><User className="w-5 h-5 text-[#B29071]" /></Link>
                  <button onClick={handleLogout} className="hover:text-red-500"><LogOut className="w-5 h-5" /></button>
                </>
              ) : (
                <Link href="/login"><User className="w-5 h-5 hover:text-[#B29071]" /></Link>
              )}
            </div>
            
            <Link href="/favoris" className="relative">
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-[#B29071] text-[#B29071]" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B29071] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/panier" className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="hidden lg:flex justify-center items-stretch gap-8 py-0 h-16 text-[12px] font-bold uppercase tracking-[0.2em] text-black/90 border-b border-gray-100 relative">
          
          <div className="h-full flex items-center static px-2" onMouseEnter={() => setActiveMegaMenu('TOUS')} onMouseLeave={() => setActiveMegaMenu(null)}>
            <Link href="/boutique" className={`hover:text-[#B29071] py-2 transition-colors ${activeMegaMenu === 'TOUS' ? 'text-[#B29071]' : ''}`}>TOUS NOS PRODUITS</Link>
            <MegaMenu category="TOUS" products={megaMenuProducts["TOUS"]} displayTitle="BOUTIQUE" />
          </div>

          {isLoaded && menuActive && <div className="flex items-center"><Link href="/selection" className="text-[#B29071]">{menuText}</Link></div>}
          
          <div className="h-full flex items-center static px-2" onMouseEnter={() => setActiveMegaMenu('VISAGE')} onMouseLeave={() => setActiveMegaMenu(null)}>
            <Link href="/boutique/Visage" className={`hover:text-[#B29071] py-2 transition-colors ${activeMegaMenu === 'VISAGE' ? 'text-[#B29071]' : ''}`}>VISAGE</Link>
            <MegaMenu category="VISAGE" products={megaMenuProducts["VISAGE"]} displayTitle="SOINS VISAGE" />
          </div>

          <div className="h-full flex items-center static px-2" onMouseEnter={() => setActiveMegaMenu('CORPS')} onMouseLeave={() => setActiveMegaMenu(null)}>
            <Link href="/boutique/Corps" className={`hover:text-[#B29071] py-2 transition-colors ${activeMegaMenu === 'CORPS' ? 'text-[#B29071]' : ''}`}>CORPS</Link>
            <MegaMenu category="CORPS" products={megaMenuProducts["CORPS"]} displayTitle="SOINS CORPS" />
          </div>

          <div className="h-full flex items-center static px-2" onMouseEnter={() => setActiveMegaMenu('CHEVEUX')} onMouseLeave={() => setActiveMegaMenu(null)}>
            <Link href="/boutique/Cheveux" className={`hover:text-[#B29071] py-2 transition-colors ${activeMegaMenu === 'CHEVEUX' ? 'text-[#B29071]' : ''}`}>CHEVEUX</Link>
            <MegaMenu category="CHEVEUX" products={megaMenuProducts["CHEVEUX"]} displayTitle="SOINS CHEVEUX" />
          </div>

          <div className="h-full flex items-center static px-2" onMouseEnter={() => setActiveMegaMenu('OFFRES')} onMouseLeave={() => setActiveMegaMenu(null)}>
            <Link href="/offres" className={`hover:text-[#B29071] py-2 transition-colors ${activeMegaMenu === 'OFFRES' ? 'text-[#B29071]' : ''}`}>NOS OFFRES</Link>
            <MegaMenu category="OFFRES" products={megaMenuProducts["OFFRES"]} displayTitle="NOS OFFRES" />
          </div>
        </nav>
      </header>

      {isSticky && <div className="h-[140px] lg:h-[180px]"></div>}

      <div className={`fixed inset-0 bg-black/50 z-[110] transition-opacity lg:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className={`absolute top-0 left-0 w-[85%] max-w-[320px] h-full bg-white transform transition-transform duration-300 shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <span className="font-serif text-lg tracking-widest text-[#B29071]">MENU</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <X className="w-6 h-6 text-black" />
            </button>
          </div>
          <div className="p-6">
            {user ? (
              <div className="mb-4 space-y-3">
                <Link href="/compte" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-3 border-b text-[11px] font-bold uppercase">
                  <User className="w-4 h-4" /> Mon Compte
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-3 border-b text-[11px] font-bold uppercase text-[#B29071]">
                    <ShieldCheck className="w-4 h-4" /> Panel Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 py-3 text-[11px] font-bold uppercase">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-3 border-b text-[11px] font-bold uppercase">
                <User className="w-4 h-4" /> Se connecter
              </Link>
            )}
            <Link href="/boutique" className="block py-4 border-b text-[12px] font-bold">TOUS NOS PRODUITS</Link>
            <Link href="/boutique/Visage" className="block py-4 border-b text-[12px] font-bold">VISAGE</Link>
            <Link href="/boutique/Corps" className="block py-4 border-b text-[12px] font-bold">CORPS</Link>
            <Link href="/boutique/Cheveux" className="block py-4 border-b text-[12px] font-bold">CHEVEUX</Link>
            <Link href="/offres" className="block py-4 border-b text-[12px] font-bold">NOS OFFRES</Link>
          </div>
        </div>
      </div>
    </>
  );
}
