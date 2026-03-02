"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Globe 
} from "lucide-react";
// MIGRACIÓN A APPWRITE
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { ID, Query } from "appwrite";

interface SocialLink {
  id: string; // Appwrite usa strings para IDs ($id)
  platform: string;
  url: string;
  is_active: boolean;
}

export default function AdminFooterPage() {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loadingData, setLoadingData] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [form, setForm] = useState({ platform: "", url: "" });
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  // ID de la colección tal como aparece en tu captura de Appwrite
  const COL_SOCIALS = 'social_links';

  useEffect(() => { 
    fetchSocials(); 
  }, []);

  async function fetchSocials() {
    try {
      setLoadingData(true);
      const response = await databases.listDocuments(
        DATABASE_ID, 
        COL_SOCIALS,
        [Query.orderAsc('$createdAt')] 
      );
      
      const mappedSocials = response.documents.map(doc => ({
        id: doc.$id,
        platform: doc.platform,
        url: doc.url,
        is_active: doc.is_active
      }));
      
      setSocials(mappedSocials);
    } catch (err: any) {
      console.error("Error Appwrite:", err);
      // Si la colección no existe o hay error de red
      if (err.code === 404) {
        notify("Colección no encontrada. Verifica el ID 'social_links'", "error");
      }
    } finally {
      setLoadingData(false);
    }
  }

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  const resetForm = () => {
    setForm({ platform: "", url: "" });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEditClick = (s: SocialLink) => {
    setIsEditing(true);
    setCurrentId(s.id);
    setForm({ platform: s.platform, url: s.url });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = { 
      platform: form.platform.toUpperCase(), 
      url: form.url,
      // Si es nuevo, por defecto lo activamos. Si editamos, no enviamos is_active para no cambiarlo.
      ...( !isEditing ? { is_active: true } : {} )
    };

    try {
      if (isEditing && currentId) {
        // Al editar, solo actualizamos plataforma y url
        await databases.updateDocument(DATABASE_ID, COL_SOCIALS, currentId, {
            platform: data.platform,
            url: data.url
        });
        notify("Lien mis à jour", "success");
      } else {
        // Al crear, enviamos todo
        await databases.createDocument(DATABASE_ID, COL_SOCIALS, ID.unique(), data);
        notify("Réseau social ajouté", "success");
      }
      resetForm();
      fetchSocials();
    } catch (err: any) {
      console.error(err);
      notify(err.message || "Erreur lors de l'enregistrement", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      // Invertimos el valor actual
      await databases.updateDocument(DATABASE_ID, COL_SOCIALS, id, { is_active: !current });
      fetchSocials();
      notify(current ? "Réseau désactivé" : "Réseau activé", "success");
    } catch (err) {
      notify("Erreur de mise à jour", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce lien définitivement ?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, COL_SOCIALS, id);
      fetchSocials();
      notify("Supprimé avec succès", "success");
    } catch (err) {
      notify("Erreur de suppression", "error");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-20 text-black font-sans">
      {/* NOTIFICATION */}
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl border bg-white flex items-center gap-3 ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{notif.msg}</span>
        </div>
      )}

      <div className="border-b pb-4">
        <h2 className="text-3xl font-serif">Gestion du Footer</h2>
        <p className="text-sm text-gray-500">Configurez les liens vers vos réseaux sociaux officiels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* FORMULAIRE */}
        <div className={`bg-white p-8 rounded-xl shadow-sm border h-fit sticky top-6 transition-all ${isEditing ? "border-[#B29071] ring-1 ring-[#B29071]" : "border-gray-100"}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#B29071] flex items-center gap-2">
              {isEditing ? <><Pencil className="w-4 h-4"/> Modifier le lien</> : <><Share2 className="w-4 h-4"/> Ajouter une plateforme</>}
            </h3>
            {isEditing && (
              <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1 block">Nom du réseau</label>
              <input type="text" placeholder="Ex: INSTAGRAM" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071] bg-gray-50 focus:bg-white transition-all" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1 block">Lien URL</label>
              <input type="url" placeholder="https://..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071] bg-gray-50 focus:bg-white transition-all" required />
            </div>
            <button type="submit" disabled={loading} className={`w-full text-white py-3 rounded text-xs font-bold uppercase tracking-widest transition-all ${isEditing ? "bg-[#B29071] hover:bg-black" : "bg-black hover:bg-[#B29071]"}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : (isEditing ? "Mettre à jour" : "Ajouter au Footer")}
            </button>
          </form>
        </div>

        {/* LISTE DES LIENS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Réseaux actifs et visibilité</h3>
          
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#B29071] mb-4" />
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Connexion à Appwrite...</p>
            </div>
          ) : socials.length > 0 ? (
            socials.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${s.is_active ? "bg-[#B29071]/10 text-[#B29071]" : "bg-gray-100 text-gray-300"}`}>
                    <Globe className="w-5 h-5"/>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{s.platform}</h4>
                    <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{s.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(s.id, s.is_active)} className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border transition-all ${s.is_active ? "text-green-600 border-green-200 bg-green-50" : "text-gray-400 border-gray-200 bg-gray-50"}`}>
                    {s.is_active ? "Actif" : "Off"}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={() => handleEditClick(s)} className="p-2 text-gray-400 hover:text-[#B29071] hover:bg-[#B29071]/10 rounded-full transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-xl">
              <Share2 className="w-10 h-10 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 text-sm italic">Aucun réseau social configuré.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}