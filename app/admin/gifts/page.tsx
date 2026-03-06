"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Pencil, CheckCircle2, XCircle, ArrowLeft, Upload, Gift, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { databases, DATABASE_ID, storage } from "@/appwriteConfig"; 
import { ID, Query } from "appwrite";

export default function GiftsPage() {
  const [loading, setLoading] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ name: "", img: "", active: true });
  const [uploading, setUploading] = useState(false);
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  const BUCKET_ID = "69a603db00195eda5d34";

  useEffect(() => { fetchGifts(); }, []);

  async function fetchGifts() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, 'gift_inventory', [Query.orderDesc('$createdAt')]);
      setGifts(res.documents);
    } catch (error) { console.error(error); }
  }

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      setForm({ ...form, img: url });
      notify("Image chargée !", "success");
    } catch (err) { notify("Erreur d'upload", "error"); } 
    finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { name: form.name, image_url: form.img, active: form.active };
    try {
      if (isEditing && currentId) {
        await databases.updateDocument(DATABASE_ID, 'gift_inventory', currentId, payload);
      } else {
        await databases.createDocument(DATABASE_ID, 'gift_inventory', ID.unique(), payload);
      }
      setForm({ name: "", img: "", active: true });
      setIsEditing(false);
      fetchGifts();
      notify("Cadeau enregistré !", "success");
    } catch (error) { notify("Erreur de sauvegarde", "error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cadeau ?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'gift_inventory', id);
      fetchGifts();
      notify("Cadeau supprimé", "success");
    } catch (error) { notify("Erreur de suppression", "error"); }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up text-black space-y-8 pb-20">
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl border bg-white flex items-center gap-3 ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-xs font-bold uppercase tracking-wider">{notif.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black transition-all">
              <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
              <h2 className="text-2xl font-serif leading-none">Gestion des Cadeaux</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Créez votre inventaire de produits offerts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#B29071] mb-6">{isEditing ? "Modifier" : "Nouveau Cadeau"}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" placeholder="Nom du cadeau" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-[#B29071]" required />
            
            <label className="flex items-center gap-2 w-full border p-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4 text-[#B29071]"/>}
                <span className="text-gray-500 truncate">{form.img ? "Image chargée ✓" : "Charger une photo"}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button type="button" onClick={() => setForm({...form, active: !form.active})} className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase transition-colors ${form.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                {form.active ? "Cadeau Actif" : "Cadeau Désactivé"}
            </button>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : "Enregistrer"}
            </button>
            {isEditing && <button type="button" onClick={() => {setIsEditing(false); setForm({name:"", img:"", active: true})}} className="w-full py-2 text-xs text-gray-400 underline">Annuler</button>}
          </form>
        </div>

        {/* LISTA DE REGALOS */}
        <div className="lg:col-span-2 space-y-4">
          {gifts.map(g => (
            <div key={g.$id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <img src={g.image_url} className="w-16 h-16 object-cover rounded-lg" alt={g.name} />
              <div className="flex-1">
                <h4 className="text-sm font-bold">{g.name}</h4>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${g.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {g.active ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {setIsEditing(true); setCurrentId(g.$id); setForm({name: g.name, img: g.image_url, active: g.active});}} className="p-2 hover:text-[#B29071]"><Pencil className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(g.$id)} className="p-2 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}