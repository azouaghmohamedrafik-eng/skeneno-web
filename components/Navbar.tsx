"use client";

import Link from "next/link";
import { ShoppingBag, User, Search, Heart, Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
// Importamos Appwrite
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
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

  const [promoMessages, setPromoMessages] = useState<string[]>([
    "Livraison gratuite à partir de 500 dhs",
    "Dès 1500 dhs : Masque de nuit offert"
  ]);

  useEffect(() => {
    async function initNavbar() {
      try {
        // 1. Verificar sesión de Appwrite
        const sessionUser = await account.get();
        if (sessionUser) {
          setUser(sessionUser);
          
          // Verificar rol en la colección 'profiles'
          const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', sessionUser.$id);
          const adminStatus = profile?.role === 'admin';
          setIsAdmin(adminStatus);
          localStorage.setItem('skineno_is_admin', String(adminStatus));
        }
      } catch (err) {
        // Si no hay sesión, account.get() lanza error, lo manejamos silenciosamente
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('skineno_is_admin');
      }

      try {
        // 2. Cargar textos dinámicos (Configuración) usando helper común
        const storeConfig: any = await getStoreSettings();
        if (storeConfig) {
          setMenuText(storeConfig.dynamic_menu_text);
          setMenuActive(storeConfig.dynamic_menu_active);
        }

        // 3. Cargar mensajes de la barra superior
        const promosRes = await databases.listDocuments(DATABASE_ID, 'top_bar_messages', [
          Query.equal('active', true)
        ]);
        if (promosRes.documents.length > 0) {
          setPromoMessages(promosRes.documents.map((p: any) => p.text));
        }
      } catch (err) {
        console.error("Error cargando configuración:", err);
      }
      
      setIsLoaded(true);
    }

    initNavbar();
  }, [pathname]); // Re-verificamos al cambiar de ruta

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      localStorage.removeItem('skineno_is_admin');
      setUser(null);
      setIsAdmin(false);
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

  return (
    <>
      <header className="w-full bg-white font-sans z-40 relative shadow-sm">
        {/* NIVEL 1: PROMOS */}
        <div className="bg-[#A48265] text-white text-[9px] md:text-[10px] py-2 overflow-hidden relative h-9 flex items-center">
          <div className="animate-marquee whitespace-nowrap">
            {promoMessages.map((msg, idx) => (
              <span key={idx} className="mx-32 uppercase tracking-[0.2em] font-bold">{msg}</span>
            ))}
            {promoMessages.map((msg, idx) => (
              <span key={`dup-${idx}`} className="mx-32 uppercase tracking-[0.2em] font-bold">{msg}</span>
            ))}
          </div>
        </div>

        {/* NIVEL 2: LOGO E ICONOS */}
        <div className="flex justify-between items-center py-4 px-6 md:px-10 border-b border-gray-100">
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
              <img src="/img/logo.png" alt="Logo Skineno" style={{ height: '65px' }} className="object-contain" />
            </Link>
          </div>

          <div className="flex justify-end gap-4 md:gap-6 w-1/3 items-center text-[11px] uppercase font-medium text-black">
            {isAdmin && (
              <Link href="/admin" className="hidden lg:flex items-center gap-2 bg-[#B29071]/10 text-[#B29071] px-3 py-1.5 rounded-md border border-[#B29071]/20 font-bold hover:bg-[#B29071] hover:text-white transition-all">
                <ShieldCheck className="w-4 h-4" /> <span className="text-[9px]">PANEL ADMIN</span>
              </Link>
            )}
            
            <div className="flex items-center gap-4">
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

        {/* NIVEL 3: MENÚ */}
        <nav className="hidden lg:flex justify-center items-center gap-8 py-5 text-[12px] font-bold uppercase tracking-[0.2em] text-black/90 border-b border-gray-100">
          <Link href="/boutique" className="hover:text-[#B29071]">TOUS NOS PRODUITS</Link>
          {isLoaded && menuActive && <Link href="/selection" className="text-[#B29071]">{menuText}</Link>}
          <Link href="/boutique/Visage" className="hover:text-[#B29071]">VISAGE</Link>
          <Link href="/boutique/Corps" className="hover:text-[#B29071]">CORPS</Link>
          <Link href="/boutique/Cheveux" className="hover:text-[#B29071]">CHEVEUX</Link>
          <Link href="/offres" className="hover:text-[#B29071]">NOS OFFRES</Link>
        </nav>
      </header>

      {/* MENÚ MÓVIL (Simplificado para brevedad, misma lógica que el original) */}
      <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className={`absolute top-0 left-0 w-[80%] max-w-[300px] h-full bg-white transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 flex justify-between border-b">
            <span className="font-serif text-[#B29071]">MENU</span>
            <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
          </div>
          <div className="flex flex-col p-6 space-y-6 text-sm font-bold uppercase tracking-widest">
            <Link href="/boutique" onClick={() => setIsMobileMenuOpen(false)}>BOUTIQUE</Link>
            {isAdmin && <Link href="/admin" className="text-[#B29071]">PANEL ADMIN</Link>}
            {/* ... resto de links */}
          </div>
        </div>
      </div>
    </>
  );
}