"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, XCircle, ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
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

  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage",
    amount: "",
    min_order_total: "",
    start_at: "",
    end_at: "",
    max_usage_global: "",
    per_user_limit: "",
    first_order_only: false,
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [singleProductId, setSingleProductId] = useState<string>("");

  useEffect(() => {
    fetchSettings();
    fetchPromos();
    fetchCoupons();
    fetchProducts();
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
    }
  }
  async function fetchCoupons() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'coupons', [Query.orderDesc('$createdAt')]);
      setCoupons(response.documents);
    } catch (error) {
    }
  }
  async function fetchProducts() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'products', [Query.limit(200), Query.orderAsc('name')]);
      setProductsList(response.documents);
    } catch (error) {
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
  const handleCreateCoupon = async () => {
    const code = couponForm.code.trim().toUpperCase();
    if (!code || !couponForm.amount || !couponForm.start_at || !couponForm.end_at) return;
    try {
      const payload: any = {
        code,
        type: couponForm.type,
        amount: parseFloat(couponForm.amount),
        min_order_total: parseFloat(couponForm.min_order_total || "0"),
        start_at: new Date(couponForm.start_at).toISOString(),
        end_at: new Date(couponForm.end_at).toISOString(),
        max_usage_global: parseInt(couponForm.max_usage_global || "0"),
        per_user_limit: parseInt(couponForm.per_user_limit || "0"),
        first_order_only: Boolean(couponForm.first_order_only),
        applicable_product_ids: selectedProductIds,
        is_active: Boolean(couponForm.is_active),
      };
      if (editingId) {
        await databases.updateDocument(DATABASE_ID, 'coupons', editingId, payload);
      } else {
        await databases.createDocument(DATABASE_ID, 'coupons', ID.unique(), payload);
      }
      setCouponForm({
        code: "",
        type: "percentage",
        amount: "",
        min_order_total: "",
        start_at: "",
        end_at: "",
        max_usage_global: "",
        per_user_limit: "",
        first_order_only: false,
        is_active: true,
      });
      setSelectedProductIds([]);
      setEditingId(null);
      fetchCoupons();
      notify(editingId ? "Coupon mis à jour" : "Coupon créé", "success");
    } catch (error) {
      notify("Erreur lors de la création", "error");
    }
  };
  const toggleCouponActive = async (id: string, current: boolean) => {
    try {
      await databases.updateDocument(DATABASE_ID, 'coupons', id, { is_active: !current });
      fetchCoupons();
    } catch (error) {
      notify("Erreur", "error");
    }
  };
  const deleteCoupon = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'coupons', id);
      fetchCoupons();
      notify("Supprimé", "success");
    } catch (error) {
      notify("Erreur", "error");
    }
  };
  const startEditCoupon = (c: any) => {
    setEditingId(c.$id);
    const toLocal = (iso: string) => {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };
    setCouponForm({
      code: c.code || "",
      type: c.type || "percentage",
      amount: String(c.amount ?? ""),
      min_order_total: String(c.min_order_total ?? ""),
      start_at: c.start_at ? toLocal(c.start_at) : "",
      end_at: c.end_at ? toLocal(c.end_at) : "",
      max_usage_global: String(c.max_usage_global ?? ""),
      per_user_limit: String(c.per_user_limit ?? ""),
      first_order_only: Boolean(c.first_order_only),
      is_active: Boolean(c.is_active),
    });
    setSelectedProductIds(Array.isArray(c.applicable_product_ids) ? c.applicable_product_ids : []);
  };
  const resetEdit = () => {
    setEditingId(null);
    setCouponForm({
      code: "",
      type: "percentage",
      amount: "",
      min_order_total: "",
      start_at: "",
      end_at: "",
      max_usage_global: "",
      per_user_limit: "",
      first_order_only: false,
      is_active: true,
    });
    setSelectedProductIds([]);
  };
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
            <p className="text-sm text-gray-500">Paramètres de campagne.</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071]">Menu de Campagne</h3>
            <div className="space-y-6">
              <input type="text" value={menuText} onChange={(e) => setMenuText(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 text-sm rounded outline-none focus:border-[#B29071]" placeholder="Texte du lien" />
              <p className="text-[11px] text-gray-400">Exemple: Ramadan • Soldes • Nouveautés</p>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setMenuActive(!menuActive)}>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${menuActive ? "bg-[#B29071]" : "bg-gray-300"}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${menuActive ? "translate-x-4" : "translate-x-0"}`}></div>
                </div>
                <label className="text-sm font-medium cursor-pointer">Afficher dans la barre</label>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071]">Cupones</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" placeholder="Code" />
                <p className="text-[11px] text-gray-400 md:col-span-2">Exemple: RAMADAN20 • BLACKFRIDAY</p>
                <select value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none">
                  <option value="percentage">% Pourcentage</option>
                  <option value="fixed">Montant fixe</option>
                </select>
                <input type="number" value={couponForm.amount} onChange={e => setCouponForm({ ...couponForm, amount: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" placeholder="Montant" />
                <p className="text-[11px] text-gray-400 md:col-span-2">Pourcentage: 20 signifie 20% • Fixe: 100 signifie 100 MAD</p>
                <input type="number" value={couponForm.min_order_total} onChange={e => setCouponForm({ ...couponForm, min_order_total: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" placeholder="Minimum commande" />
                <input type="datetime-local" value={couponForm.start_at} onChange={e => setCouponForm({ ...couponForm, start_at: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" />
                <input type="datetime-local" value={couponForm.end_at} onChange={e => setCouponForm({ ...couponForm, end_at: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" />
                <input type="number" value={couponForm.max_usage_global} onChange={e => setCouponForm({ ...couponForm, max_usage_global: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" placeholder="Limite globale (0 illimité)" />
                <input type="number" value={couponForm.per_user_limit} onChange={e => setCouponForm({ ...couponForm, per_user_limit: e.target.value })} className="bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none" placeholder="Limite par utilisateur (0 illimité)" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={couponForm.first_order_only} onChange={e => setCouponForm({ ...couponForm, first_order_only: e.target.checked })} />
                  Premier achat uniquement
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={couponForm.is_active} onChange={e => setCouponForm({ ...couponForm, is_active: e.target.checked })} />
                  Actif
                </label>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">Produits éligibles (liste)</label>
                  <select 
                    value={singleProductId} 
                    onChange={e => { 
                      const val = e.target.value; 
                      setSingleProductId(val); 
                      setSelectedProductIds(val ? [val] : []); 
                    }} 
                    className="w-full bg-gray-50 border border-gray-200 p-3 text-sm rounded outline-none"
                  >
                    <option value="">Tous les produits</option>
                    {productsList.map(p => (
                      <option key={p.$id} value={p.$id}>{p.name}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-2">Choisissez un produit spécifique ou laissez “Tous les produits”.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleCreateCoupon} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition">
                  {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? "Mettre à jour" : "Créer"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetEdit} className="px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-[#B29071]">Liste des coupons</h3>
          <div className="space-y-3">
            {coupons.map(c => (
              <div key={c.$id} className="flex items-center justify-between border-b pb-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-bold">{c.code}</span>
                  <span className="text-gray-500">{c.type === "percentage" ? `${c.amount}%` : `${c.amount} MAD`}</span>
                  <span className="text-gray-400">{new Date(c.start_at).toLocaleString()} → {new Date(c.end_at).toLocaleString()}</span>
                  <span className={`text-xs font-bold uppercase ${c.is_active ? "text-green-600" : "text-gray-400"}`}>{c.is_active ? "actif" : "inactif"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => startEditCoupon(c)} className="px-3 py-1 rounded border text-xs">
                    Éditer
                  </button>
                  <button type="button" onClick={() => toggleCouponActive(c.$id, c.is_active)} className="px-3 py-1 rounded border text-xs">
                    {c.is_active ? "Désactiver" : "Activer"}
                  </button>
                  <button type="button" onClick={() => deleteCoupon(c.$id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {coupons.length === 0 && <p className="text-xs text-gray-500">Aucun coupon pour le moment.</p>}
          </div>
        </div>

        <button type="submit" disabled={loading} className="bg-black text-white px-12 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B29071] transition flex items-center gap-3 mx-auto shadow-xl">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Enregistrer la configuration
        </button>
      </form>
    </div>
  );
}
