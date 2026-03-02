"use client";

import { useEffect, useState } from "react";
// Importamos Appwrite
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  User, 
  LogOut, 
  Save, 
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Profile {
  full_name: string;
  phone: string;
  address: string;
  city: string;
}

export default function ComptePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    address: "",
    city: ""
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      // Obtenemos el usuario actual de Appwrite
      const sessionUser = await account.get();
      setUser(sessionUser);

      // Intentamos cargar el perfil desde la colección 'profiles'
      try {
        const data: any = await databases.getDocument(DATABASE_ID, 'profiles', sessionUser.$id);
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || ""
          });
        }
      } catch (profileError) {
        // Si no existe el documento de perfil, simplemente lo dejamos vacío para que lo cree al guardar
        console.log("Perfil no encontrado, se creará al guardar.");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    const payload = {
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
    };

    try {
      // Intentamos actualizar. Si falla (porque no existe), lo creamos.
      try {
        await databases.updateDocument(DATABASE_ID, 'profiles', user.$id, payload);
      } catch (err) {
        await databases.createDocument(DATABASE_ID, 'profiles', user.$id, payload);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#B29071]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans pb-20">
      <div className="bg-white border-b border-gray-100">
        <main className="max-w-5xl mx-auto px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif mb-2">
                Bonjour, {profile.full_name ? profile.full_name.split(' ')[0] : 'Client'}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Espace Personnel Skeneno</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors border border-red-50 px-5 py-2.5 rounded-full bg-red-50/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Se déconnecter
            </button>
          </div>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="space-y-4">
            <div className="bg-white p-4 md:p-6 shadow-sm border border-gray-100 rounded-2xl">
              <h3 className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-[#B29071] mb-6">Menu</h3>
              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                <button 
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === "info" ? "bg-[#B29071] text-white shadow-md" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                >
                  <User className="w-4 h-4" /> <span className="hidden sm:inline">Mes informations</span><span className="sm:hidden">Infos</span>
                </button>
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === "orders" ? "bg-[#B29071] text-white shadow-md" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                >
                  <Package className="w-4 h-4" /> <span className="hidden sm:inline">Mes commandes</span><span className="sm:hidden">Commandes</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeTab === "info" && (
              <div className="bg-white p-6 md:p-10 shadow-sm border border-gray-100 rounded-2xl animate-fade-in-up relative">
                {success && (
                  <div className="absolute top-4 right-6 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Profil mis à jour</span>
                  </div>
                )}
                <h2 className="text-xl font-serif mb-8 flex items-center gap-3">
                  <User className="w-5 h-5 text-[#B29071]" /> Détails du compte
                </h2>
                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom complet</label>
                      <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#B29071] text-sm transition-all bg-transparent" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Téléphone</label>
                      <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#B29071] text-sm transition-all bg-transparent" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Adresse de livraison</label>
                    <input type="text" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#B29071] text-sm transition-all bg-transparent" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ville</label>
                    <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full border-b border-gray-100 py-2 outline-none focus:border-[#B29071] text-sm transition-all bg-transparent" required />
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={updating} className="w-full md:w-auto bg-black text-white px-12 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-black/10">
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Enregistrer</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {activeTab === "orders" && (
              <div className="bg-white p-10 md:p-20 shadow-sm border border-gray-100 rounded-2xl animate-fade-in-up text-center">
                <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#B29071]/10">
                  <ShoppingBag className="w-8 h-8 text-[#B29071] opacity-40" />
                </div>
                <h2 className="text-2xl font-serif mb-4">Aucune commande pour l'instant</h2>
                <p className="text-sm text-gray-400 font-light mb-10 max-w-xs mx-auto leading-relaxed">
                  Votre historique de commandes est vide. Accédez à la boutique pour découvrir nos rituels de soin.
                </p>
                <Link href="/boutique" className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all shadow-lg shadow-black/10">
                  <ArrowLeft className="w-4 h-4" /> Retour à la boutique
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}