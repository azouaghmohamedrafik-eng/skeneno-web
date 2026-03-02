"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Share2, 
  Menu, 
  X,
  LayoutDashboard // <-- Icono para el Dashboard
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems =[
    { name: "Inventaire", href: "/admin/inventaire", icon: ShoppingBag },
    { name: "Slider (Accueil)", href: "/admin/slider", icon: ImageIcon },
    { name: "Gestion Footer", href: "/admin/footer", icon: Share2 },
    { name: "Configuration", href: "/admin/configuration", icon: Settings }, // <-- Actualizado
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-800">
      
      {/* --- CABECERA PARA MÓVIL (Solo visible en pantallas pequeñas) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <div className="text-center">
          <h1 className="text-lg font-serif tracking-[0.2em] text-[#B29071]">SKINENO</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* --- FONDO OSCURO PARA MÓVIL AL ABRIR EL MENÚ --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
      `}>
        <div className="h-24 flex items-center justify-center border-b border-gray-100 hidden md:flex">
          <div className="text-center">
            <h1 className="text-xl font-serif tracking-[0.2em] text-[#B29071]">SKINENO</h1>
            <span className="text-[9px] uppercase tracking-widest text-gray-400">Panneau de Contrôle</span>
          </div>
        </div>
        
        <nav className="p-6 space-y-2 flex-1 mt-16 md:mt-0">
          
          {/* BOTÓN: TABLEAU DE BORD (DASHBOARD) */}
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-bold rounded-lg transition-all mb-6 ${
              pathname === "/admin"
                ? "bg-gray-100 text-black shadow-sm" // Estilo activo (Gris claro)
                : "text-gray-500 hover:bg-gray-50 hover:text-[#B29071]"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === "/admin" ? "text-orange-500" : ""}`} /> 
            TABLEAU DE BORD
          </Link>

          {/* RESTO DEL MENÚ */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Detecta si estamos en esta ruta
            const isActive = pathname.startsWith(item.href); 
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-bold rounded-lg transition-all ${
                  isActive 
                    ? "bg-[#B29071] text-white shadow-md" // Estilo activo para las demás
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#B29071]"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.name}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN SALIR */}
        <div className="p-6 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors">
            <LogOut className="w-4 h-4" /> Voir le site
          </Link>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto mt-16 md:mt-0 w-full">
        {children}
      </main>
    </div>
  );
}