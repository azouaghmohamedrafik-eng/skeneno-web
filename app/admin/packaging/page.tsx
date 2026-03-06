"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, XCircle, ArrowLeft, Upload, Gift, Package, Info, Image as ImageIcon, Sparkles, Target, ChevronDown } from "lucide-react";
import Link from "next/link";
import { databases, DATABASE_ID, storage } from "@/appwriteConfig"; 
import { ID, Query } from "appwrite";

export default function PackagingPage() {
  const [loading, setLoading] = useState(false);
  const [giftItems, setGiftItems] = useState<any[]>([]); // Lista específica de regalos
  
  // --- ESTADOS PARA PACKAGING ---
  const [boxImg, setBoxImg] = useState("");
  const [boxPrice, setBoxPrice] = useState("0");
  const [boxActive, setBoxActive] = useState(false);
  const [bagImg, setBagImg] = useState("");
  const [bagPrice, setBagPrice] = useState("0");
  const [bagActive, setBagActive] = useState(false);
  
  // --- ESTADOS PARA REGLA DE REGALO ---
  const [giftActive, setGiftActive] = useState(false);
  const [giftThreshold, setGiftThreshold] = useState("0");
  const [giftName, setGiftName] = useState("");
  const [giftProductId, setGiftProductId] = useState(""); 

  const [uploading, setUploading] = useState({ box: false, bag: false });
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  const BUCKET_ID = "69a603db00195eda5d34";

  useEffect(() => { 
    fetchSettings(); 
    fetchGifts(); // Cambiado a fetchGifts
  }, []);

  // --- CORRECCIÓN: Cargamos la colección gift_inventory ---
  async function fetchGifts() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, 'gift_inventory', [Query.orderAsc('name'), Query.limit(100)]);
      setGiftItems(res.documents);
    } catch (error) { console.error("Error regalos:", error); }
  }

  async function fetchSettings() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'packaging_settings', [Query.limit(1)]);
      if (response.documents.length > 0) {
        const data: any = response.documents[0];
        setBoxImg(data.box_image || "");
        setBoxPrice(data.box_price?.toString() || "0");
        setBoxActive(data.box_active || false);
        setBagImg(data.bag_image || "");
        setBagPrice(data.bag_price?.toString() || "0");
        setBagActive(data.bag_active || false);
        setGiftActive(data.gift_active || false);
        setGiftThreshold(data.gift_threshold?.toString() || "0");
        setGiftName(data.gift_name || "");
        setGiftProductId(data.gift_product_id || "");
      }
    } catch (error) { console.error(error); }
  }

  const handlePkgUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'box' | 'bag') => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      const file = e.target.files?.[0];
      if (!file) return;
      const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      if (type === 'box') setBoxImg(url); else setBagImg(url);
      setNotif({ show: true, msg: "Image mise à jour !", type: "success" });
      setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
    } catch (err) { setNotif({ show: true, msg: "Erreur d'upload", type: "error" }); } 
    finally { setUploading(prev => ({ ...prev, [type]: false })); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const resPkg = await databases.listDocuments(DATABASE_ID, 'packaging_settings', [Query.limit(1)]);
      const payload = {
        box_image: boxImg, 
        box_price: parseFloat(boxPrice) || 0, 
        box_active: boxActive,
        bag_image: bagImg, 
        bag_price: parseFloat(bagPrice) || 0, 
        bag_active: bagActive,
        gift_active: giftActive, 
        gift_threshold: parseFloat(giftThreshold) || 0, 
        gift_name: giftName,
        gift_product_id: giftProductId 
      };
      if (resPkg.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, 'packaging_settings', resPkg.documents[0].$id, payload);
      } else {
        await databases.createDocument(DATABASE_ID, 'packaging_settings', ID.unique(), payload);
      }
      setNotif({ show: true, msg: "Configuration enregistrée !", type: "success" });
    } catch (error) { setNotif({ show: true, msg: "Erreur de sauvegarde", type: "error" }); }
    finally { setLoading(false); setTimeout(() => setNotif(p => ({ ...p, show: false })), 3000); }
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
              <h2 className="text-2xl font-serif leading-none">Marketing & Panier</h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Réglages des offres et packaging</p>
          </div>
        </div>
      </div>

      <div className="bg-black text-white p-7 rounded-[2rem] shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B29071] rounded-xl"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Offre Cadeau Automatique</h3>
                <p className="text-[10px] text-gray-400 uppercase">Barre de progression visible dans le panier</p>
            </div>
          </div>
          <button onClick={() => setGiftActive(!giftActive)} className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${giftActive ? 'bg-[#B29071]' : 'bg-gray-700'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${giftActive ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-gray-500 tracking-widest ml-1">Nom de l'offre (Texte)</label>
            <input type="text" value={giftName} onChange={e => setGiftName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white text-sm outline-none focus:border-[#B29071]" placeholder="ex: Masque de nuit offert" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-gray-500 tracking-widest ml-1">Produit à offrir (Liste cadeaux)</label>
            <div className="relative">
              <select 
                value={giftProductId} 
                onChange={e => setGiftProductId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-sm text-white outline-none focus:border-[#B29071] appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-400">Choisir un cadeau...</option>
                {giftItems.map(g => <option key={g.$id} value={g.$id} className="text-black">{g.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-gray-500 tracking-widest ml-1">Seuil (DHS)</label>
            <div className="relative">
                <input type="number" value={giftThreshold} onChange={e => setGiftThreshold(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white text-sm outline-none focus:border-[#B29071]" placeholder="1500" />
                <Target className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#B29071]"><Gift className="w-5 h-5" /><h4 className="font-bold uppercase tracking-widest text-xs">Coffret Luxe</h4></div>
            <button onClick={() => setBoxActive(!boxActive)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${boxActive ? 'bg-black' : 'bg-gray-200'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${boxActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
            {boxImg ? <img src={boxImg} className="w-full h-full object-contain p-4" alt="Box" /> : <ImageIcon className="w-8 h-8 text-gray-200 mx-auto" />}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-1">
              <Upload className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Charger</span>
              <input type="file" className="hidden" onChange={(e) => handlePkgUpload(e, 'box')} />
            </label>
          </div>
          <input type="number" value={boxPrice} onChange={e => setBoxPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#B29071]" />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#B29071]"><Package className="w-5 h-5" /><h4 className="font-bold uppercase tracking-widest text-xs">Pochette Satin</h4></div>
            <button onClick={() => setBagActive(!bagActive)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${bagActive ? 'bg-black' : 'bg-gray-200'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${bagActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
            {bagImg ? <img src={bagImg} className="w-full h-full object-contain p-4" alt="Bag" /> : <ImageIcon className="w-8 h-8 text-gray-200 mx-auto" />}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-1">
              <Upload className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Charger</span>
              <input type="file" className="hidden" onChange={(e) => handlePkgUpload(e, 'bag')} />
            </label>
          </div>
          <input type="number" value={bagPrice} onChange={e => setBagPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-[#B29071]" />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button onClick={handleSave} disabled={loading} className="bg-black text-white px-14 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all flex items-center gap-3 shadow-lg active:scale-95 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Enregistrer les réglages
        </button>
      </div>
    </div>
  );
}