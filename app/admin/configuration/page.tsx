"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, CheckCircle2, XCircle, Megaphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
// AJUSTE DE RUTA: Ahora estamos un nivel más profundo (/admin/configuration)
import { databases, DATABASE_ID } from "@/appwriteConfig"; 
import { ID, Query } from "appwrite";

export default function SettingsPage() {
  const [menuText, setMenuText] = useState("");
  const [menuActive, setMenuActive] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [promoMessages, setPromoMessages] = useState<{id: string, text: string, active: boolean}[]>([]);
  const [newPromo, setNewPromo] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);

  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  useEffect(() => {
    fetchSettings();
    fetchPromos();
  }, []);

  async function fetchSettings() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'store_settings', [Query.limit(1)]);
      if (response.documents.length > 0) {
        const data: any = response.documents[0];
        setMenuText(data.dynamic_menu_text);
        setMenuActive(data.dynamic_menu_active);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }

  async function fetchPromos() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'top_bar_messages');
      const formattedPromos = response.documents.map((doc: any) => ({
        id: doc.$id,
        text: doc.text,
        active: doc.active
      }));
      setPromoMessages(formattedPromos);
    } catch (error) {
      console.error("Error fetching promos:", error);
    }
  }

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'store_settings', [Query.limit(1)]);
      
      const payload = { 
        dynamic_menu_text: menuText, 
        dynamic_menu_active: menuActive 
      };

      if (response.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, 'store_settings', response.documents[0].$id, payload);
      } else {
        await databases.createDocument(DATABASE_ID, 'store_settings', ID.unique(), payload);
      }
      notify("Configuration mise à jour !", "success");
    } catch (error) {
      notify("Erreur lors de l'enregistrement", "error");
    }
    setLoading(false);
  };

  const handleAddPromo = async () => {
    if (!newPromo.trim()) return;
    setLoadingPromo(true);
    try {
      await databases.createDocument(DATABASE_ID, 'top_bar_messages', ID.unique(), { 
        text: newPromo,
        active: true 
      });
      setNewPromo("");
      fetchPromos();
      notify("Message ajouté", "success");
    } catch (error) {
      notify("Erreur al añadir promo", "error");
    }
    setLoadingPromo(false);
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'top_bar_messages', id);
      fetchPromos();
      notify("Message supprimé", "success");
    } catch (error) {
      notify("Erreur al eliminar", "error");
    }
  };

  const togglePromo = async (id: string, currentStatus: boolean) => {
    try {
      await databases.updateDocument(DATABASE_ID, 'top_bar_messages', id, { active: !currentStatus });
      fetchPromos();
    } catch (error) {
      notify("Erreur al cambiar estado", "error");
    }
  };

  return (
    <div className="max-w-4xl animate-fade-in-up text-black space-y-8 pb-20">
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl border bg-white flex items-center gap-3 ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{notif.msg}</span>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link href="/admin" className="md:hidden p-2 bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
            <h2 className="text-3xl font-serif">Configuration</h2>
            <p className="text-sm text-gray-500">Paramètres globaux de Skeneno.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071]">Menu de Campagne</h3>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Texte du lien</label>
              <input type="text" value={menuText} onChange={(e) => setMenuText(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 text-sm rounded outline-none focus:border-[#B29071]" placeholder="ex: SÉLECTION RAMADAN" />
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setMenuActive(!menuActive)}>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${menuActive ? "bg-[#B29071]" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${menuActive ? "translate-x-4" : "translate-x-0"}`}></div>
              </div>
              <label className="text-sm font-medium cursor-pointer select-none">Afficher dans la barre</label>
            </div>
            <button type="submit" className="bg-black text-white px-8 py-3 rounded text-xs uppercase font-bold tracking-widest hover:bg-[#B29071] transition flex items-center gap-2 w-full justify-center md:w-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Enregistrer
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071] flex items-center gap-2">
            <Megaphone className="w-4 h-4" /> Barre Promotionnelle
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Nouveau message..." value={newPromo} onChange={e => setNewPromo(e.target.value)} className="flex-1 border p-3 rounded text-sm outline-none focus:border-[#B29071]" />
              <button onClick={handleAddPromo} disabled={loadingPromo} className="bg-black text-white p-3 rounded hover:bg-[#B29071] transition">
                {loadingPromo ? <Loader2 className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>}
              </button>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Messages actifs</p>
              {promoMessages.map((m: any) => (
                <div key={m.id} className="text-xs bg-gray-50 p-3 rounded flex justify-between items-center group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={m.active} onChange={() => togglePromo(m.id, m.active)} className="accent-[#B29071] w-4 h-4" />
                    <span className={m.active ? "text-black" : "text-gray-400 line-through"}>{m.text}</span>
                  </div>
                  <button onClick={() => handleDeletePromo(m.id)} className="text-gray-300 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              ))}
              {promoMessages.length === 0 && <p className="text-center text-gray-400 text-[10px] py-4 italic">Aucun message</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}