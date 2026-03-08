"use client";

import { useEffect, useState } from "react";
// Importamos Appwrite
import { account, databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  User, 
  LogOut, 
  Save, 
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowLeft,
  Mail,
  Clock,
  Truck
} from "lucide-react";
import Link from "next/link";

interface Profile {
  full_name: string;
  email: string;
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
    email: "",
    phone: "",
    address: "",
    city: ""
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const sessionUser = await account.get();
      setUser(sessionUser);

      // Cargar perfil
      try {
        const data: any = await databases.getDocument(DATABASE_ID, 'profiles', sessionUser.$id);
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || sessionUser.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || ""
          });
        }
      } catch {
        console.log("Creando perfil...");
      }

      // Cargar pedidos del usuario
      const ordersRes = await databases.listDocuments(DATABASE_ID, 'orders', [
        Query.equal('user_id', sessionUser.$id),
        Query.orderDesc('$createdAt')
      ]);
      setOrders(ordersRes.documents);

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

    try {
      await databases.updateDocument(DATABASE_ID, 'profiles', user.$id, profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      // Si no existía, lo creamos
      await databases.createDocument(DATABASE_ID, 'profiles', user.$id, profile);
      setSuccess(true);
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
      console.error("Error logout:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ";
    switch (status) {
      case "en attente": return <span className={baseClass + "bg-amber-50 text-amber-600 border-amber-100"}><Clock className="w-2.5 h-2.5 inline mr-1" /> En attente</span>;
      case "expédié": return <span className={baseClass + "bg-blue-50 text-blue-600 border-blue-100"}><Truck className="w-2.5 h-2.5 inline mr-1" /> Expédié</span>;
      case "livré": return <span className={baseClass + "bg-green-50 text-green-600 border-green-100"}><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" /> Livré</span>;
      default: return <span className={baseClass + "bg-gray-50 text-gray-400 border-gray-100"}>{status}</span>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Loader2 className="w-8 h-8 animate-spin text-[#B29071]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black font-sans pb-20">
      <div className="bg-white border-b border-gray-100">
        <main className="max-w-5xl mx-auto px-6 py-10 md:py-16 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif mb-2 uppercase tracking-tighter">
                Bonjour, {profile.full_name ? profile.full_name.split(' ')[0] : 'Client'}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Votre rituel Skinino</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-red-600 border border-red-50 px-6 py-3 rounded-full bg-red-50/20 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Se déconnecter
            </button>
          </div>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* SIDEBAR TABS */}
          <div className="space-y-4">
            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-2xl">
              <nav className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                <button onClick={() => setActiveTab("info")} className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-5 py-4 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === "info" ? "bg-[#B29071] text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                  <User className="w-4 h-4" /> Profil
                </button>
                <button onClick={() => setActiveTab("orders")} className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-5 py-4 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === "orders" ? "bg-[#B29071] text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                  <Package className="w-4 h-4" /> Commandes ({orders.length})
                </button>
              </nav>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="lg:col-span-2">
            {activeTab === "info" && (
              <div className="bg-white p-6 md:p-10 shadow-sm border border-gray-100 rounded-2xl animate-fade-in-up relative">
                {success && (
                  <div className="absolute top-4 right-6 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Mis à jour</span>
                  </div>
                )}
                <h2 className="text-xl font-serif mb-10 flex items-center gap-3">
                   <User className="w-6 h-6 text-[#B29071]" /> Informations Personnelles
                </h2>
                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom complet</label>
                      <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email de contact</label>
                      <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Téléphone</label>
                        <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ville</label>
                        <input type="text" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Adresse de livraison</label>
                    <input type="text" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#B29071] text-sm bg-transparent" required />
                  </div>
                  <button type="submit" disabled={updating} className="w-full md:w-auto bg-black text-white px-14 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all flex items-center justify-center gap-3 shadow-xl">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Enregistrer</>}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6 animate-fade-in-up">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-3 px-2">
                   <Package className="w-6 h-6 text-[#B29071]" /> Historique des commandes
                </h2>
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.$id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commande #{order.$id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.$createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs font-medium text-gray-700 leading-relaxed">{order.items}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Payé</span>
                      <span className="text-lg font-bold text-[#B29071]">{order.total.toFixed(2)} MAD</span>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-20 text-center rounded-2xl border border-gray-100">
                    <ShoppingBag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm font-light italic">Aucune commande encore enregistrée.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
