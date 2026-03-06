"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Loader2, 
  ShoppingBag, 
  Image as ImageIcon, 
  Settings, 
  Share2, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  CreditCard,
  Gift,
  HelpCircle // Icono para la guía
} from "lucide-react";
import Link from "next/link";
import { account, databases, DATABASE_ID } from "../../appwriteConfig";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const user = await account.get();
        const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', user.$id);
        if (isMounted) {
          if (profile && profile.role === 'admin') {
            setAuthorized(true);
            setLoading(false);
          } else {
            router.replace("/");
          }
        }
      } catch (error: any) {
        if (isMounted) router.replace("/login");
      }
    }
    checkAuth();
    return () => { isMounted = false; };
  }, [router]);

  const menuItems = [
    { name: "Produits", href: "/admin/inventaire", icon: ShoppingBag }, 
    { name: "Stock", href: "/admin/stock", icon: Package },             
    { name: "Commandes", href: "/admin/commandes", icon: CreditCard },
    { name: "Packaging", href: "/admin/packaging", icon: Gift },
    { name: "Slider", href: "/admin/slider", icon: ImageIcon },
    { name: "Footer", href: "/admin/footer", icon: Share2 },
    { name: "Config", href: "/admin/configuration", icon: Settings },
    { name: "Guide", href: "/admin/guide", icon: HelpCircle }, // NUEVA SECCIÓN
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-black">
      <Loader2 className="w-10 h-10 animate-spin text-[#B29071] mb-4" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Vérification...</p>
    </div>
  );

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-800">
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-30 flex items-center justify-between px-4">
        <h1 className="text-lg font-serif text-[#B29071]">SKINENO</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r flex flex-col shadow-sm transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen md:sticky md:top-0`}>
        <div className="h-24 flex items-center justify-center border-b hidden md:flex">
          <div className="text-center">
            <h1 className="text-xl font-serif tracking-widest text-[#B29071]">SKINENO</h1>
            <span className="text-[9px] uppercase text-gray-400 font-bold">Admin</span>
          </div>
        </div>
        <nav className="p-6 space-y-2 flex-1 mt-16 md:mt-0">
          <Link href="/admin" className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg ${pathname === "/admin" ? "bg-gray-100 text-black" : "text-gray-500"}`}>
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </Link>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase rounded-lg transition-all ${pathname.startsWith(item.href) ? "bg-[#B29071] text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}>
              <item.icon className="w-4 h-4" /> {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t">
          <Link href="/" className="flex items-center gap-3 text-xs font-bold text-gray-400 hover:text-black">
            <LogOut className="w-4 h-4" /> SITE PUBLIC
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-12 overflow-y-auto mt-16 md:mt-0 w-full">{children}</main>
    </div>
  );
}