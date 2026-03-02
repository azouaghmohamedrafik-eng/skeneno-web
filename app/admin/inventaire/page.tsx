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
  Upload, 
  Tag,
  Gift,
  Percent,
  Star 
} from "lucide-react";
// MIGRACIÓN A APPWRITE
import { databases, DATABASE_ID, storage } from "@/appwriteConfig";
import { ID, Query } from "appwrite"; 

interface Product {
  id: string; 
  name: string; 
  price: number; 
  image_url: string;
  description: string; 
  format: string; 
  ingredients: string; 
  category_id: string | null;
  is_offer: boolean; 
  is_gift: boolean;   
  is_visage: boolean;    
  is_corps: boolean;     
  is_cheveux: boolean;   
  is_special: boolean; 
}

interface Category { 
  id: string; 
  name: string; 
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    name: "", price: "", format: "", desc: "", ing: "", cat: "", img: "",
    isOffer: false, isGift: false, isVisage: false, isCorps: false, isCheveux: false, isSpecial: false 
  });
  
  const [uploading, setUploading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [currentCatId, setCurrentCatId] = useState<string | null>(null);
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  // CORRECCIÓN: Usar el ID real del bucket desde variables de entorno o el ID directo
  const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "69a603db00195eda5d34";

  useEffect(() => { 
    fetchData(); 
  }, []);

  async function fetchData() {
    try {
      const resP = await databases.listDocuments(DATABASE_ID, 'products', [Query.orderDesc('$createdAt')]);
      const resC = await databases.listDocuments(DATABASE_ID, 'categories', [Query.orderAsc('name')]);
      
      setProducts(resP.documents.map(d => ({
        id: d.$id,
        name: d.name,
        price: d.price,
        image_url: d.image_url,
        description: d.description,
        format: d.format,
        ingredients: d.ingredients,
        category_id: d.category_id,
        is_offer: d.is_offer,
        is_gift: d.is_gift,
        is_visage: d.is_visage,
        is_corps: d.is_corps,
        is_cheveux: d.is_cheveux,
        is_special: d.is_special
      })));

      setCategories(resC.documents.map(d => ({ id: d.$id, name: d.name })));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  // --- CATEGORÍAS ---
  const handleSaveCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      if (isEditingCat && currentCatId) {
        await databases.updateDocument(DATABASE_ID, 'categories', currentCatId, { name: newCatName });
        notify("Catégorie modifiée", "success");
      } else {
        await databases.createDocument(DATABASE_ID, 'categories', ID.unique(), { name: newCatName });
        notify("Catégorie ajoutée", "success");
      }
      setNewCatName(""); setIsEditingCat(false); setCurrentCatId(null);
      fetchData();
    } catch (e: any) { notify(e.message, "error"); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'categories', id);
      notify("Catégorie supprimée", "success");
      fetchData();
    } catch (e) { notify("Erreur: La catégorie est peut-être liée à des produits", "error"); }
  };

  // --- PRODUCTOS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
      // Construcción de URL pública
      const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      
      setForm({ ...form, img: url });
      notify("Image téléchargée !", "success");
    } catch (err) { 
      console.error(err);
      notify("Erreur d'upload", "error"); 
    }
    finally { setUploading(false); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // CORRECCIÓN: Enviar null si el string está vacío para evitar error de formato URL
    const data = {
      name: form.name, 
      price: parseFloat(form.price), 
      image_url: form.img || null, // <--- AQUÍ ESTABA EL ERROR (Si es "" falla, debe ser null)
      description: form.desc, 
      format: form.format, 
      ingredients: form.ing,
      category_id: form.cat || null,
      is_offer: form.isOffer,
      is_gift: form.isGift,
      is_visage: form.isVisage,   
      is_corps: form.isCorps,     
      is_cheveux: form.isCheveux,
      is_special: form.isSpecial
    };

    try {
      if (isEditing && currentId) {
        await databases.updateDocument(DATABASE_ID, 'products', currentId, data);
      } else {
        await databases.createDocument(DATABASE_ID, 'products', ID.unique(), data);
      }
      // Resetear formulario
      setForm({ name: "", price: "", format: "", desc: "", ing: "", cat: "", img: "", isOffer: false, isGift: false, isVisage: false, isCorps: false, isCheveux: false, isSpecial: false });
      setIsEditing(false);
      fetchData();
      notify("Produit enregistré !", "success");
    } catch (err: any) {
      console.error("Save product error:", err);
      const msg = err?.message || (typeof err === 'string' ? err : "Erreur d'enregistrement");
      notify(msg, "error");
    }
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if(!confirm("Supprimer ce produit ?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'products', id);
      fetchData();
      notify("Produit supprimé", "success");
    } catch (error) {
      notify("Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      {/* NOTIFICATION */}
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl border bg-white flex items-center gap-3 ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{notif.msg}</span>
        </div>
      )}

      <div className="border-b pb-4">
        <h2 className="text-3xl font-serif text-black">Inventaire & Stock</h2>
        <p className="text-sm text-gray-500">Gérez vos produits et vos catégories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULAIRE PRODUIT */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#B29071] mb-6 flex items-center gap-2">
            {isEditing ? <Pencil className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} 
            {isEditing ? "Modifier le produit" : "Ajouter un produit"}
          </h3>
          
          <form onSubmit={handleSaveProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Prix (DHS)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" required />
                <input type="text" placeholder="Format" value={form.format} onChange={e => setForm({...form, format: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071] bg-white">
                <option value="">Catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <label className="flex items-center gap-2 w-full border p-3 rounded text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4 text-[#B29071]"/>}
                <span className="text-gray-500 truncate">{form.img ? "Image chargée ✓" : "Charger una photo"}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Tags</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                {/* Checkboxes manuales para asegurar control */}
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.isVisage} onChange={e => setForm({...form, isVisage: e.target.checked})} className="w-4 h-4 accent-[#B29071]" />
                    <span className="text-[11px] font-bold uppercase text-gray-600">Visage</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.isCorps} onChange={e => setForm({...form, isCorps: e.target.checked})} className="w-4 h-4 accent-[#B29071]" />
                    <span className="text-[11px] font-bold uppercase text-gray-600">Corps</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={form.isCheveux} onChange={e => setForm({...form, isCheveux: e.target.checked})} className="w-4 h-4 accent-[#B29071]" />
                    <span className="text-[11px] font-bold uppercase text-gray-600">Cheveux</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.isOffer} onChange={e => setForm({...form, isOffer: e.target.checked})} className="w-4 h-4 accent-[#B29071]" />
                  <Percent className="w-3 h-3 text-[#B29071]" /><span className="text-[11px] font-bold uppercase text-gray-600">Offre</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.isGift} onChange={e => setForm({...form, isGift: e.target.checked})} className="w-4 h-4 accent-[#B29071]" />
                  <Gift className="w-3 h-3 text-[#B29071]" /><span className="text-[11px] font-bold uppercase text-gray-600">Cadeau</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.isSpecial} onChange={e => setForm({...form, isSpecial: e.target.checked})} className="w-4 h-4 accent-[#B29071]" />
                  <Star className="w-3 h-3 text-[#B29071]" /><span className="text-[11px] font-bold uppercase text-gray-600">Spécial</span>
                </label>
              </div>
            </div>

            <textarea placeholder="Description..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full border p-3 rounded text-sm h-24 outline-none focus:border-[#B29071] resize-none" />
            <textarea placeholder="Ingrédients..." value={form.ing} onChange={e => setForm({...form, ing: e.target.value})} className="w-full border p-3 rounded text-sm h-24 outline-none focus:border-[#B29071] resize-none" />

            <div className="flex justify-end gap-3">
              {isEditing && (
                <button type="button" onClick={() => {setIsEditing(false); setForm({name:"", price:"", format:"", desc:"", ing:"", cat:"", img:"", isOffer: false, isGift: false, isVisage: false, isCorps: false, isCheveux: false, isSpecial: false})}} className="px-6 py-3 text-xs font-bold uppercase text-gray-400">Annuler</button>
              )}
              <button type="submit" disabled={loading || uploading} className="bg-black text-white px-10 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>

        {/* CATEGORÍAS */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#B29071] mb-6 flex items-center gap-2"><Tag className="w-4 h-4" /> Catégories</h3>
          <div className="flex gap-2 mb-6">
            <input type="text" placeholder="Nom" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 border p-2 rounded text-sm outline-none focus:border-[#B29071]" />
            <button onClick={handleSaveCategory} className="bg-black text-white p-2 rounded hover:bg-[#B29071] transition">{isEditingCat ? <CheckCircle2 className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}</button>
          </div>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="text-xs bg-gray-50 p-3 rounded flex justify-between items-center group">
                <span>{c.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => {setIsEditingCat(true); setCurrentCatId(c.id); setNewCatName(c.name);}} className="text-gray-400 hover:text-[#B29071] p-1"><Pencil className="w-3.5 h-3.5"/></button>
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-10">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b font-bold text-[10px] uppercase text-gray-500">
            <tr><th className="p-4">Produit</th><th className="p-4">Étiquettes</th><th className="p-4">Prix</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group text-sm">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.image_url || "/placeholder.png"} className="w-10 h-10 object-cover rounded border" alt={p.name} />
                  <div className="flex flex-col">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{categories.find(c => c.id === p.category_id)?.name || "—"}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.is_visage && <span className="bg-gray-100 text-[7px] font-bold px-1 py-0.5 rounded">VISAGE</span>}
                    {p.is_offer && <span className="bg-orange-50 text-orange-600 text-[7px] font-bold px-1 py-0.5 rounded">OFFRE</span>}
                    {p.is_special && <span className="bg-yellow-50 text-yellow-700 text-[7px] font-bold px-1 py-0.5 rounded">SPÉCIAL</span>}
                  </div>
                </td>
                <td className="p-4 font-bold text-[#B29071]">{p.price.toFixed(2)} DHS</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => {
                      setIsEditing(true); setCurrentId(p.id);
                      setForm({ name:p.name, price:p.price.toString(), format:p.format || "", desc:p.description || "", ing:p.ingredients || "", cat:p.category_id || "", img:p.image_url, isOffer: p.is_offer, isGift: p.is_gift, isVisage: p.is_visage, isCorps: p.is_corps, isCheveux: p.is_cheveux, isSpecial: p.is_special });
                      window.scrollTo({top: 0, behavior: 'smooth'});
                    }} className="text-gray-400 hover:text-[#B29071] p-2 hover:bg-gray-50 rounded-full"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}