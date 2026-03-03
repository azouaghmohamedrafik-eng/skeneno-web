"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Instagram, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti"; // Opcional: si quieres un efecto de celebración

export default function ThankYouPage() {
  
  // Efecto visual de éxito al cargar
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#B29071', '#000000', '#ffffff']
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
        
        {/* ICONO DE ÉXITO */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#B29071]/20 blur-3xl rounded-full scale-150"></div>
            <CheckCircle2 className="w-24 h-24 text-[#B29071] relative z-10" strokeWidth={1} />
          </div>
        </div>

        {/* MENSAJE PRINCIPAL */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif tracking-tight">Merci pour votre confiance</h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#B29071] font-bold">
            Commande enregistrée avec succès
          </p>
        </div>

        {/* CUADRO DE INFORMACIÓN */}
        <div className="bg-[#FDFBF7] border border-[#B29071]/10 p-8 rounded-3xl space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Votre commande est en cours de traitement. Vous devriez avoir été redirigé vers <strong>WhatsApp</strong> para finaliser les détails de la livraison avec notre équipe.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-4 border-t border-[#B29071]/10">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <MessageCircle className="w-4 h-4" /> Assistance 24/7
            </div>
            <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Instagram className="w-4 h-4" /> @Skineno_Maroc
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link 
            href="/" 
            className="px-10 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#B29071] transition-all shadow-xl flex items-center justify-center gap-3"
          >
            Retour à l'accueil
          </Link>
          <Link 
            href="/boutique" 
            className="px-10 py-4 border border-gray-200 text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:border-black transition-all flex items-center justify-center gap-3"
          >
            Continuer le shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-[9px] text-gray-400 uppercase tracking-widest pt-10">
          Skineno — L'art du soin marocain authentique
        </p>
      </div>
    </div>
  );
}