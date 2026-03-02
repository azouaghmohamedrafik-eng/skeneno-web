"use client";

import { useState, useEffect } from "react";
// Importamos account desde tu config de Appwrite
import { account } from "@/appwriteConfig";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Verificar si ya hay sesión activa al cargar
  useEffect(() => {
    async function checkActiveSession() {
      try {
        await account.get();
        // Si no lanza error, es que hay sesión
        router.push("/");
      } catch (err) {
        // No hay sesión, el usuario se queda aquí
      }
    }
    checkActiveSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // En Appwrite se usa createEmailPasswordSession
      await account.createEmailPasswordSession(email, password);
      
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <main className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Connexion</h1>
          <p className="text-sm text-gray-500 font-light">Bon retour dans l'univers Skeneno.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 text-xs rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              required 
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Se connecter"}
          </button>

          <div className="text-center space-y-4 pt-4">
            <Link href="#" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Mot de passe oublié ?</Link>
            <div className="h-px bg-gray-100 w-full"></div>
            <p className="text-[11px] text-gray-400">
              Nouveau chez Skeneno ? <Link href="/register" className="text-black font-bold underline">Créer un compte</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}