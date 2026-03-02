"use client";

import { useEffect, useState } from "react";
// Importamos Appwrite
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { Facebook, Instagram, Youtube, Gift, Beaker, Leaf, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const COL_SOCIALS = 'social_links';

export default function Footer() {
  const pathname = usePathname();
  const [socials, setSocials] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSocials() {
      try {
        // En Appwrite filtramos con Query.equal
        const response = await databases.listDocuments(
          DATABASE_ID, 
          COL_SOCIALS, 
          [Query.equal('is_active', true)]
        );
        
        if (response.documents) {
          setSocials(response.documents);
        }
      } catch (error: any) {
        // Si la colección no existe todavía, solo emitimos una advertencia ligera
        if (error.message && error.message.toLowerCase().includes('could not be found')) {
          console.warn(`Colección \\"${COL_SOCIALS}\\" no encontrada. Omitting social links.`);
        } else {
          console.error("Error fetching socials:", error);
        }
      }
    }
    fetchSocials();
  }, []);

  // REGLA: Si estamos en Admin, el Footer no se renderiza
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-gray-100 font-sans text-black mt-auto">
      
      {/* 1. SECCIÓN VENTAJAS */}
      <div className="max-w-7xl mx-auto px-6 py-10 border-b border-gray-200">
        <div className="flex flex-wrap justify-center md:justify-between gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <div className="flex items-center gap-3"><Gift className="w-4 h-4 text-[#A48265]" /> <span>Cadeaux exclusifs</span></div>
          <div className="flex items-center gap-3"><Beaker className="w-4 h-4 text-[#A48265]" /> <span>Échantillons offerts</span></div>
          <div className="flex items-center gap-3"><Leaf className="w-4 h-4 text-[#A48265]" /> <span>Conseils beauté</span></div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          {/* COLUMNA IZQUIERDA: NEWSLETTER */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Newsletter</h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Découvrez en avant-première nos moments forts et nouveautés, suivez la vie de la marque et rejoignez la communauté.
            </p>
            <form className="flex border-b border-black py-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Veuillez saisir votre email.." 
                className="bg-transparent flex-1 outline-none text-xs"
              />
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-[#A48265] transition-colors">S'abonner</button>
            </form>
          </div>

          {/* COLUMNA CENTRAL: GAMAS Y AYUDA */}
          <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-8 md:pl-12">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Nos Gammes</h3>
              <ul className="text-sm text-gray-500 font-light space-y-3">
                <li><Link href="/boutique/Visage" className="hover:text-black transition-colors">Soins Visage</Link></li>
                <li><Link href="/boutique/Corps" className="hover:text-black transition-colors">Soins Corps</Link></li>
                <li><Link href="/boutique/Cheveux" className="hover:text-black transition-colors">Soins Cheveux</Link></li>
                <li><Link href="/boutique" className="hover:text-black transition-colors">Tous nos soins</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Aide & Contact</h3>
              <ul className="text-sm text-gray-500 font-light space-y-3">
                <li><Link href="#" className="hover:text-black transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-black transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* COLUMNA DERECHA: REDES SOCIALES */}
          <div className="md:col-span-4 space-y-8 md:text-right">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Suivez-nous</h3>
            <div className="flex flex-wrap md:justify-end gap-6">
              {socials.map((s) => (
                <a 
                  key={s.$id} 
                  href={s.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-[#A48265] transition-colors"
                >
                  {renderIcon(s.platform)}
                  <span>{s.platform}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. BARRA LEGAL INFERIOR */}
      <div className="bg-white py-6 border-t border-gray-100 text-[9px] uppercase tracking-widest text-gray-400 font-medium text-center">
        <div className="flex justify-center gap-6 mb-2">
          <Link href="#" className="hover:text-black transition-colors">Mentions Légales</Link>
          <Link href="#" className="hover:text-black transition-colors">CGV</Link>
          <Link href="#" className="hover:text-black transition-colors">Livraison</Link>
        </div>
        <p>© 2026 Skineno. Tous droits réservés.</p>
      </div>
    </footer>
  );
}