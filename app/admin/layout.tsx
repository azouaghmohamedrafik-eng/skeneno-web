"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ShoppingBag, Image as ImageIcon, Settings, Share2, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { account, databases, DATABASE_ID } from "../../appwriteConfig";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        // Intentamos obtener el usuario
        const user = await account.get();
        
        // Si hay usuario, verificamos si es admin
        const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', user.$id);
        
        if (isMounted) {
          if (profile && profile.role === 'admin') {
            setAuthorized(true);
            setLoading(false);
          } else {
            router.replace("/"); // No es admin, fuera
          }
        }
      } catch (error: any) {
        // Si falla account.get() o no hay perfil, mandamos al login
        if (isMounted) {
          console.warn("Acceso no autorizado al panel admin.");
          router.replace("/login");
        }
      }
    }

    checkAuth();
    return () => { isMounted = false; };
  }, [router]);

  const menuItems = [
    { name: "Inventaire", href: "/admin/inventaire", icon: ShoppingBag },
    { name: "Slider (Accueil)", href: "/admin/slider", icon: ImageIcon },
    { name: "Gestion Footer", href: "/admin/footer", icon: Share2 },
    { name: "Configuration", href: "/admin/configuration", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#B29071] mb-4" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Sécurisation du panneau...</p>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-800">
      {/* HEADER MÓVIL */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center justify-between px-4 shadow-sm">
        <h1 className="text-lg font-serif tracking-widest text-[#B29071]">SKINENO</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col shadow-sm transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen md:sticky md:top-0`}>
        <div className="h-24 flex items-center justify-center border-b hidden md:flex">
          <div className="text-center">
            <h1 className="text-xl font-serif tracking-widest text-[#B29071]">SKINENO</h1>
            <span className="text-[9px] uppercase text-gray-400">Admin</span>
          </div>
        </div>
        <nav className="p-6 space-y-2 flex-1 mt-16 md:mt-0">
          <Link href="/admin" className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg ${pathname === "/admin" ? "bg-gray-100 text-black" : "text-gray-500"}`}>
            <LayoutDashboard className="w-4 h-4" /> TABLEAU DE BORD
          </Link>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg ${pathname.startsWith(item.href) ? "bg-[#B29071] text-white" : "text-gray-500"}`}>
              <item.icon className="w-4 h-4" /> {item.name.toUpperCase()}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t">
          <Link href="/" className="flex items-center gap-3 text-xs font-bold text-gray-400 hover:text-black">
            <LogOut className="w-4 h-4" /> VOIR LE SITE
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto mt-16 md:mt-0 w-full">{children}</main>
    </div>
  );
}