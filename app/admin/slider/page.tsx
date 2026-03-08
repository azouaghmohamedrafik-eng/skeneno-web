"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  X, 
  Loader2, 
  Upload, 
  Info, 
  CheckCircle2, 
  XCircle,
  Image as ImageIcon,
  AlertTriangle
} from "lucide-react";
// IMPORTACIÓN DE APPWRITE
import { databases, DATABASE_ID, storage } from "@/appwriteConfig";
import { ID, Query } from "appwrite";

const IMAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "69a603db00195eda5d34";
const VIDEO_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_VIDEO_BUCKET_ID || IMAGE_BUCKET_ID;
const HERO_VIDEO_PREFIX = "__HERO_VIDEO__:";
const MAX_VIDEO_SIZE_MB = 60;

interface Slide { 
  id: string; // Appwrite usa strings para IDs ($id)
  title: string; 
  subtitle: string; 
  description: string; 
  image1_url: string; 
  image2_url: string; 
  product_id?: string | null; 
}

interface Product {
  id: string;
  name: string;
}

export default function SliderPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [products, setProducts] = useState<Product[]>([]); 
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [form, setForm] = useState({ 
    title: "", 
    sub: "", 
    desc: "", 
    img1: "", 
    img2: "",
    prodId: "" 
  });

  const [up1, setUp1] = useState(false);
  const [up2, setUp2] = useState(false);
  const [upVideo, setUpVideo] = useState(false);
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoActive, setHeroVideoActive] = useState(false);
  const [heroVideoDocId, setHeroVideoDocId] = useState<string | null>(null);

  useEffect(() => { 
    fetchSlides(); 
    fetchProducts(); 
    fetchVideoConfig();
  },[]);

  async function fetchSlides() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'hero_slides');
      const formatted = response.documents.map(doc => ({
        id: doc.$id,
        title: doc.title,
        subtitle: doc.subtitle,
        description: doc.description,
        image1_url: doc.image1_url,
        image2_url: doc.image2_url,
        product_id: doc.product_id
      }));
      setSlides(formatted);
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  }

  async function fetchProducts() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'products', [Query.orderAsc('name')]);
      const formatted = response.documents.map(doc => ({
        id: doc.$id,
        name: doc.name
      }));
      setProducts(formatted);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function fetchVideoConfig() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'top_bar_messages', [Query.limit(200)]);
      const cfgDoc: any = response.documents.find((doc: any) =>
        String(doc.text || "").startsWith(HERO_VIDEO_PREFIX)
      );
      if (!cfgDoc) {
        setHeroVideoUrl("");
        setHeroVideoActive(false);
        setHeroVideoDocId(null);
        return;
      }
      setHeroVideoDocId(cfgDoc.$id);
      const parsed = JSON.parse(String(cfgDoc.text).replace(HERO_VIDEO_PREFIX, ""));
      const loadedUrl = String(parsed?.url || "");
      setHeroVideoUrl(loadedUrl);
      setHeroVideoActive(Boolean(parsed?.active));
    } catch (error) {
      setHeroVideoUrl("");
      setHeroVideoActive(false);
      setHeroVideoDocId(null);
    }
  }

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  const extractErrorMessage = (err: any) => {
    const candidates = [
      err?.response?.message,
      err?.response?.error,
      err?.message,
      err?.code,
    ];
    const msg = candidates.find((c) => typeof c === "string" && c.trim().length > 0);
    return msg || "Erreur d'envoi vidéo";
  };

  const extractFileIdFromStorageUrl = (url: string) => {
    if (!url) return "";
    const match = url.match(/\/files\/([^/]+)\/view/i);
    return match?.[1] || "";
  };

  const deleteVideoFileIfExists = async (url: string) => {
    const fileId = extractFileIdFromStorageUrl(url);
    if (!fileId) return;
    try {
      await storage.deleteFile(VIDEO_BUCKET_ID, fileId);
    } catch (error) {}
  };

  const saveVideoConfig = async (url: string, active: boolean, existingDocId?: string | null) => {
    const serialized = `${HERO_VIDEO_PREFIX}${JSON.stringify({ url, active })}`;
    if (existingDocId) {
      await databases.updateDocument(DATABASE_ID, 'top_bar_messages', existingDocId, {
        text: serialized,
        active: false
      });
      setHeroVideoDocId(existingDocId);
      return;
    }
    const created = await databases.createDocument(DATABASE_ID, 'top_bar_messages', ID.unique(), {
      text: serialized,
      active: false
    });
    setHeroVideoDocId(created.$id);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, num: 1 | 2) => {
    const setOp = num === 1 ? setUp1 : setUp2;
    try {
      setOp(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Subida a Appwrite Storage
      const uploadedFile = await storage.createFile(IMAGE_BUCKET_ID, ID.unique(), file);

      // Obtener URL pública (Appwrite genera la URL basada en el endpoint y el fileId)
      const publicUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${IMAGE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      setForm(prev => ({ ...prev, [num === 1 ? 'img1' : 'img2']: publicUrl }));
      notify("Image chargée !", "success");
    } catch (err) {
      console.error("Upload error:", err);
      const msg = (err as any)?.message || "Erreur d'envoi";
      notify(msg, "error");
    } finally {
      setOp(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUpVideo(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
      if (!allowedTypes.includes(file.type)) {
        notify("Format non supporté. Utilisez mp4, webm ou mov.", "error");
        return;
      }
      const maxBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
      if (file.size > maxBytes) {
        notify(`Vidéo trop lourde. Maximum ${MAX_VIDEO_SIZE_MB}MB.`, "error");
        return;
      }
      const uploadedFile = await storage.createFile(VIDEO_BUCKET_ID, ID.unique(), file);
      const publicUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${VIDEO_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      const previousVideoUrl = heroVideoUrl;
      const nextActive = heroVideoActive || !heroVideoUrl;
      setHeroVideoUrl(publicUrl);
      setHeroVideoActive(nextActive);
      await saveVideoConfig(publicUrl, nextActive, heroVideoDocId);
      if (previousVideoUrl && previousVideoUrl !== publicUrl) {
        await deleteVideoFileIfExists(previousVideoUrl);
      }
      notify("Vidéo mise à jour", "success");
    } catch (err) {
      const msg = extractErrorMessage(err);
      notify(`${msg}. Vérifiez dans bucket product-images: extensions mp4/webm/mov + taille max >= ${MAX_VIDEO_SIZE_MB}MB.`, "error");
    } finally {
      setUpVideo(false);
    }
  };

  const handleToggleVideo = async () => {
    if (!heroVideoUrl) return;
    try {
      const next = !heroVideoActive;
      setHeroVideoActive(next);
      await saveVideoConfig(heroVideoUrl, next, heroVideoDocId);
      notify(next ? "Vidéo activée" : "Vidéo désactivée", "success");
    } catch (error) {
      notify("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDeleteVideo = async () => {
    try {
      const previousVideoUrl = heroVideoUrl;
      setHeroVideoUrl("");
      setHeroVideoActive(false);
      await saveVideoConfig("", false, heroVideoDocId);
      if (previousVideoUrl) {
        await deleteVideoFileIfExists(previousVideoUrl);
      }
      notify("Vidéo supprimée", "success");
    } catch (error) {
      notify("Erreur lors de la suppression", "error");
    }
  };

  const handleEditClick = (slide: Slide) => {
    setIsEditing(true);
    setCurrentId(slide.id);
    setForm({
      title: slide.title,
      sub: slide.subtitle,
      desc: slide.description,
      img1: slide.image1_url,
      img2: slide.image2_url,
      prodId: slide.product_id || "" 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ title: "", sub: "", desc: "", img1: "", img2: "", prodId: "" });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && slides.length >= 4) {
      return notify("Maximum 4 slides autorisées !", "error");
    }
    
    setLoading(true);
    const data = {
      title: form.title,
      subtitle: form.sub,
      description: form.desc,
      image1_url: form.img1,
      image2_url: form.img2,
      product_id: form.prodId || null 
    };

    try {
      if (isEditing && currentId) {
        await databases.updateDocument(DATABASE_ID, 'hero_slides', currentId, data);
      } else {
        await databases.createDocument(DATABASE_ID, 'hero_slides', ID.unique(), data);
      }
      resetForm();
      fetchSlides();
      notify(isEditing ? "Slide modifiée !" : "Slide ajoutée !", "success");
    } catch (error) {
      console.error("Save slide error:", error);
      const msg = (error as any)?.message || "Erreur lors de l'enregistrement";
      notify(msg, "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette diapositive ?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'hero_slides', id);
      fetchSlides();
      notify("Supprimé avec succès", "success");
    } catch (error) {
      notify("Erreur lors de la suppression", "error");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      {/* NOTIFICATION */}
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 border bg-white ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-medium">{notif.msg}</span>
        </div>
      )}

      <div className="border-b pb-4">
        <h2 className="text-2xl font-serif text-black">Slider d'Accueil</h2>
        <p className="text-sm text-gray-500">Gérez les visuels et messages de la page principale (Max 4).</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#B29071] mb-4">Vidéo d'entrée</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <div className="space-y-3">
            <label className="flex items-center gap-2 border p-3 rounded text-xs cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 text-[#B29071]" />
              <span className="truncate">
                {upVideo ? "Chargement..." : heroVideoUrl ? "Changer la vidéo" : "Ajouter une vidéo"}
              </span>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleVideo}
                disabled={!heroVideoUrl}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition ${heroVideoActive ? "bg-black text-white border-black" : "border-gray-300 text-gray-500"} disabled:opacity-40`}
              >
                {heroVideoActive ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                onClick={handleDeleteVideo}
                disabled={!heroVideoUrl}
                className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-200 transition disabled:opacity-40"
              >
                Supprimer
              </button>
            </div>
            <p className="text-[11px] text-gray-400">Si la vidéo est vide ou désactivée, rien ne s'affiche sur le site. Bucket actual: {VIDEO_BUCKET_ID} • Max recomendado: {MAX_VIDEO_SIZE_MB}MB.</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            {heroVideoUrl ? (
              <video src={heroVideoUrl} className="w-full max-h-[260px] rounded-lg bg-black" muted playsInline controls />
            ) : (
              <div className="h-[180px] rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                Aucune vidéo configurée
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* FORMULAIRE */}
        <div className="lg:col-span-1">
          {slides.length < 4 || isEditing ? (
            <div className={`bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-6 ${isEditing ? "border-[#B29071] ring-1 ring-[#B29071]" : "border-gray-100"}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#B29071] flex items-center gap-2">
                  {isEditing ? <><Pencil className="w-4 h-4"/> Modifier Slide</> : <><Plus className="w-4 h-4"/> Nouvelle Slide</>}
                </h3>
                {isEditing && (
                  <button onClick={resetForm} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <input type="text" placeholder="Titre Principal" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" required />
                <input type="text" placeholder="Sous-titre" value={form.sub} onChange={e => setForm({...form, sub: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071]" required />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Lier à un produit</label>
                  <select 
                    value={form.prodId} 
                    onChange={e => setForm({...form, prodId: e.target.value})}
                    className="w-full border p-3 rounded text-sm outline-none focus:border-[#B29071] bg-white"
                  >
                    <option value="">Aucun produit (Bouton désactivé)</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <textarea placeholder="Description" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full border p-3 rounded text-sm h-24 outline-none focus:border-[#B29071] resize-none" required />
                
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Visuels</p>
                  
                  <label className="flex items-center gap-2 border p-3 rounded text-xs cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4 text-[#B29071]"/>
                    <span className="truncate">{up1 ? "Chargement..." : (form.img1 ? "Image 1 chargée ✓" : "Image 1 (Centre)")}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 1)} />
                  </label>

                  <label className="flex items-center gap-2 border p-3 rounded text-xs cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4 text-[#B29071]"/>
                    <span className="truncate">{up2 ? "Chargement..." : (form.img2 ? "Image 2 chargée ✓" : "Image 2 (Droite)")}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 2)} />
                  </label>
                </div>

                <button type="submit" disabled={loading || up1 || up2} className="w-full bg-black text-white py-3 rounded text-[11px] font-bold uppercase tracking-widest hover:bg-[#B29071] transition disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : (isEditing ? "Mettre à jour" : "Ajouter au slider")}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-orange-50 p-8 rounded-xl border border-orange-100 text-center h-fit">
              <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <p className="text-orange-800 font-bold text-sm">Limite atteinte</p>
              <p className="text-xs text-orange-600 mt-1">Supprimez une diapositive pour en créer une nueva.</p>
            </div>
          )}
        </div>

        {/* LISTE DES SLIDES */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Diapositives Actives ({slides.length}/4)</h3>
          
          {slides.map((s, i) => (
            <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center relative group transition-all hover:shadow-md">
              <div className="flex gap-2 shrink-0">
                {s.image1_url ? (
                  <img src={s.image1_url} className="w-16 h-24 object-cover rounded border border-gray-100 shadow-sm" alt="Preview 1" />
                ) : (
                  <div className="w-16 h-24 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300"/></div>
                )}
                {s.image2_url ? (
                  <img src={s.image2_url} className="w-16 h-24 object-cover rounded border border-gray-100 shadow-sm" alt="Preview 2" />
                ) : (
                  <div className="w-16 h-24 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300"/></div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <span className="text-[9px] font-bold text-[#B29071] bg-[#B29071]/10 px-2 py-1 rounded uppercase">Position #{i+1}</span>
                <h4 className="font-serif font-bold text-lg text-black mt-2">{s.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.subtitle}</p>
                
                <p className="text-[10px] font-bold text-[#B29071] uppercase mb-2">
                  Lien: {products.find(p => p.id === s.product_id)?.name || "Aucun produit"}
                </p>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{s.description}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEditClick(s)} className="p-3 bg-gray-50 text-gray-400 hover:text-[#B29071] hover:bg-[#B29071]/10 rounded-full transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Aucune diapositive configurée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
