"use client";

import { useState } from "react";
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!fullName.trim()) {
      setError("Le nom complet est requis.");
      return;
    }

    setLoading(true);
    try {
      // crear usuario en Appwrite con un ID único
      const user = await account.create(ID.unique(), email, password, fullName);

      // crear documento de perfil paralelo
      await databases.createDocument(DATABASE_ID, 'profiles', user.$id, {
        full_name: fullName,
        phone,
        address,
        city,
      });

      // iniciar sesión automáticamente
      await account.createEmailPasswordSession(email, password);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Erreur lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <main className="max-w-md mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Créer un compte</h1>
          <p className="text-sm text-gray-500 font-light">Rejoignez l'univers Skeneno !</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 text-xs rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Nom complet</label>
            <input
              type="text"
              placeholder="Votre nom et prénom"
              required
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Confirmer mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Téléphone</label>
            <input
              type="tel"
              placeholder="06 00 00 00 00"
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Adresse</label>
            <input
              type="text"
              placeholder="Rue, numéro, etc."
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Ville</label>
            <input
              type="text"
              placeholder="Casablanca, Rabat…"
              className="w-full border-b border-gray-200 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent transition-colors"
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'inscrire"}
          </button>

          <div className="text-center space-y-4 pt-4">
            <p className="text-[11px] text-gray-400">
              Déjà inscrit ? <Link href="/login" className="text-black font-bold underline">Se connecter</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}