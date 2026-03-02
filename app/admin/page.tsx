"use client";

import Link from "next/link";
import { ShoppingBag, Image as ImageIcon, Settings, Share2, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const cards =[
    { 
      title: "Inventaire", 
      desc: "Gérez les produits et le stock", 
      href: "/admin/inventaire", 
      icon: ShoppingBag,
      color: "bg-blue-500"
    },
    { 
      title: "Diaporama", 
      desc: "Modifiez les diapositives du héros", 
      href: "/admin/slider", 
      icon: ImageIcon,
      color: "bg-purple-500"
    },
    { 
      title: "Pied de page", 
      desc: "Configurez le pied de page", 
      href: "/admin/footer", 
      icon: Share2,
      color: "bg-green-500"
    },
    { 
      title: "Paramètres", 
      desc: "Menu dynamique et messages promotionnels", 
      href: "/admin/configuration", // IMPORTANTE: Ahora apunta a la nueva carpeta
      icon: Settings,
      color: "bg-orange-500"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-serif text-black">Panneau d'Administration</h2>
        <p className="text-sm text-gray-500 mt-2">Sélectionnez une section pour commencer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link 
              key={index} 
              href={card.href}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col items-center text-center h-full"
            >
              <div className={`w-12 h-12 rounded-lg ${card.color} text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-xs text-gray-500 mb-6 flex-1">{card.desc}</p>
              
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B29071] flex items-center gap-1 group-hover:gap-2 transition-all">
                Accéder <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}