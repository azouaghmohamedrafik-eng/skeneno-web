import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Configuración de fuentes
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair',
  display: 'swap',
});

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Skineno | Cosmétique de Luxe",
  description: "L'art du soin marocain par Skineno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased bg-white text-black min-h-screen flex flex-col">
        {/* Envolvamos todo en los contextos necesarios */}
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            {/* El flex-grow asegura que el Footer siempre esté al fondo si hay poco contenido */}
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}