"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, CheckCircle2, XCircle, Megaphone, ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";
import { databases, DATABASE_ID } from "@/appwriteConfig"; 
import { ID, Query } from "appwrite";

export default function SettingsPage() {
  const [menuText, setMenuText] = useState("");
  const [menuActive, setMenuActive] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [promoMessages, setPromoMessages] = useState<{id: string, text: string, active: boolean}[]>([]);
  const [newPromo, setNewPromo] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);

  // --- ESTADOS PARA REGLAS DE REGALO ---
  const [giftActive, setGiftActive] = useState(false);
  const [giftThreshold, setGiftThreshold] = useState("0");
  const [giftName, setGiftName] = useState("");

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
        // Cargar reglas de regalo
        setGiftActive(data.gift_active || false);
        setGiftThreshold(data.gift_threshold?.toString() || "0");
        setGiftName(data.gift_name || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }

  async function fetchPromos() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'top_bar_messages');
      const formattedPromos = response.documents.map((doc: any) => ({
        id: doc.$id, text: doc.text, active: doc.active
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
        dynamic_menu_active: menuActive,
        gift_active: giftActive,
        gift_threshold: parseFloat(giftThreshold),
        gift_name: giftName
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
      await databases.createDocument(DATABASE_ID, 'top_bar_messages', ID.unique(), { text: newPromo, active: true });
      setNewPromo(""); fetchPromos(); notify("Message ajouté", "success");
    } catch (error) { notify("Erreur", "error"); }
    setLoadingPromo(false);
  };

  const togglePromo = async (id: string, currentStatus: boolean) => {
    try {
      await databases.updateDocument(DATABASE_ID, 'top_bar_messages', id, { active: !currentStatus });
      fetchPromos();
    } catch (error) { notify("Erreur", "error"); }
  };

  return (
    <div className="max-w-5xl animate-fade-in-up text-black space-y-8 pb-20">
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl border bg-white flex items-center gap-3 ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{notif.msg}</span>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link href="/admin" className="p-2 bg-gray-100 rounded-full text-gray-600"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
            <h2 className="text-3xl font-serif">Configuration</h2>
            <p className="text-sm text-gray-500">Paramètres globaux et règles marketing.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* MENU DE CAMPAGNE */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071]">Menu de Campagne</h3>
            <div className="space-y-6">
              <input type="text" value={menuText} onChange={(e) => setMenuText(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 text-sm rounded outline-none focus:border-[#B29071]" placeholder="Texte du lien" />
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setMenuActive(!menuActive)}>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${menuActive ? "bg-[#B29071]" : "bg-gray-300"}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${menuActive ? "translate-x-4" : "translate-x-0"}`}></div>
                </div>
                <label className="text-sm font-medium cursor-pointer">Afficher dans la barre</label>
              </div>
            </div>
          </div>

          {/* RÈGLES DE CADEAUX (NUEVO) */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071] flex items-center gap-2"><Gift className="w-4 h-4"/> Règles de Cadeaux</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setGiftActive(!giftActive)}>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${giftActive ? "bg-black" : "bg-gray-300"}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${giftActive ? "translate-x-4" : "translate-x-0"}`}></div>
                </div>
                <label className="text-sm font-medium cursor-pointer">Activer l'offre cadeau</label>
              </div>
              <input type="number" value={giftThreshold} onChange={e => setGiftThreshold(e.target.value)} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" placeholder="Montant minimum (DHS)" />
              <input type="text" value={giftName} onChange={e => setGiftName(e.target.value)} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" placeholder="Nom du cadeau (ex: Masque de nuit)" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="bg-black text-white px-12 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition flex items-center gap-3 mx-auto shadow-xl">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Enregistrer la configuration
        </button>
      </form>
    </div>
  );
}