"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Plus, Save, Trash2, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { ID, Query } from "appwrite";

interface DeliveryRate {
  $id: string;
  zone: string;
  lead_time: string;
  shipping_fee: string;
  free_from: string;
  sort_order: number;
  active: boolean;
}

export default function AdminLivraisonPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });
  const [form, setForm] = useState({
    enabled: true,
    panel_title: "DÉTAIL DE LA LIVRAISON",
    section_1_title: "1. Livraison standard offerte au Maroc",
    section_1_content: "Livraison offerte pour toute commande dès 500 Dhs",
    section_2_title: "2. Informations d’expédition et tarifs",
    section_2_content_html: "",
    notes_html: "",
  });
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif((prev) => ({ ...prev, show: false })), 2800);
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [settingsRes, ratesRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, "delivery_settings", [Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, "delivery_rates", [Query.orderAsc("sort_order"), Query.limit(200)]),
      ]);

      if (settingsRes.documents.length > 0) {
        const s: any = settingsRes.documents[0];
        setSettingsId(s.$id);
        setForm({
          enabled: s.enabled !== false,
          panel_title: s.panel_title || "DÉTAIL DE LA LIVRAISON",
          section_1_title: s.section_1_title || "",
          section_1_content: s.section_1_content || "",
          section_2_title: s.section_2_title || "",
          section_2_content_html: s.section_2_content_html || "",
          notes_html: s.notes_html || "",
        });
      }

      setRates(
        ratesRes.documents.map((r: any) => ({
          $id: r.$id,
          zone: r.zone || "",
          lead_time: r.lead_time || "",
          shipping_fee: r.shipping_fee || "",
          free_from: r.free_from || "",
          sort_order: Number(r.sort_order || 0),
          active: r.active !== false,
        }))
      );
    } catch (error: any) {
      notify(error?.message || "Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }

  const insertHtmlTag = (textareaRef: React.RefObject<HTMLTextAreaElement | null>, tag: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = el.value.slice(start, end) || "texte";
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const next = el.value.slice(0, start) + open + selected + close + el.value.slice(end);
    const key = textareaRef === contentRef ? "section_2_content_html" : "notes_html";
    setForm((prev) => ({ ...prev, [key]: next }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + open.length, start + open.length + selected.length);
    }, 0);
  };

  const insertRateTable = (textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    const tableHtml = `
<h3>Tarifs de livraison</h3>
<table>
  <thead>
    <tr>
      <th>Zones</th>
      <th>Délais de livraison</th>
      <th>Frais de livraison</th>
      <th>Livraison offerte</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Zone 1 - Rabat</td>
      <td>24 à 48 heures ouvrées*</td>
      <td>49,00 Dhs</td>
      <td>à partir de 500dhs</td>
    </tr>
  </tbody>
</table>
`.trim();
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = el.value.slice(0, start) + tableHtml + el.value.slice(end);
    const key = textareaRef === contentRef ? "section_2_content_html" : "notes_html";
    setForm((prev) => ({ ...prev, [key]: next }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (settingsId) {
        await databases.updateDocument(DATABASE_ID, "delivery_settings", settingsId, payload);
      } else {
        const created = await databases.createDocument(DATABASE_ID, "delivery_settings", ID.unique(), payload);
        setSettingsId(created.$id);
      }
      notify("Livraison enregistrée", "success");
    } catch (error: any) {
      notify(error?.message || "Erreur de sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  const addRate = async () => {
    try {
      const payload = {
        zone: "Zone",
        lead_time: "",
        shipping_fee: "",
        free_from: "",
        sort_order: rates.length + 1,
        active: true,
      };
      const created: any = await databases.createDocument(DATABASE_ID, "delivery_rates", ID.unique(), payload);
      setRates((prev) => [
        ...prev,
        {
          $id: created.$id,
          zone: created.zone || "Zone",
          lead_time: created.lead_time || "",
          shipping_fee: created.shipping_fee || "",
          free_from: created.free_from || "",
          sort_order: Number(created.sort_order || prev.length + 1),
          active: created.active !== false,
        },
      ]);
      notify("Ligne ajoutée", "success");
    } catch (error: any) {
      notify(error?.message || "Erreur création ligne", "error");
    }
  };

  const updateRateLocal = (id: string, key: keyof DeliveryRate, value: string | number | boolean) => {
    setRates((prev) => prev.map((r) => (r.$id === id ? { ...r, [key]: value } : r)));
  };

  const saveRate = async (rate: DeliveryRate) => {
    try {
      await databases.updateDocument(DATABASE_ID, "delivery_rates", rate.$id, {
        zone: rate.zone,
        lead_time: rate.lead_time,
        shipping_fee: rate.shipping_fee,
        free_from: rate.free_from,
        sort_order: Number(rate.sort_order || 0),
        active: rate.active,
      });
      notify("Ligne sauvegardée", "success");
    } catch (error: any) {
      notify(error?.message || "Erreur sauvegarde ligne", "error");
    }
  };

  const deleteRate = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, "delivery_rates", id);
      setRates((prev) => prev.filter((r) => r.$id !== id));
      notify("Ligne supprimée", "success");
    } catch (error: any) {
      notify(error?.message || "Erreur suppression ligne", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#B29071]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8 animate-fade-in-up">
      {notif.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl border bg-white flex items-center gap-3 ${notif.type === "success" ? "border-green-100 text-green-800" : "border-red-100 text-red-800"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-xs font-bold uppercase tracking-wider">{notif.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-serif leading-none">Livraison</h2>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Bloc latéral de la fiche produit</p>
          </div>
        </div>
        <button onClick={handleSaveSettings} disabled={saving} className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#B29071] transition-all flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#B29071]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#B29071]">Paramètres du panneau</p>
          </div>
          <button onClick={() => setForm((prev) => ({ ...prev, enabled: !prev.enabled }))} className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${form.enabled ? "bg-[#B29071]" : "bg-gray-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.enabled ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={form.panel_title} onChange={(e) => setForm((p) => ({ ...p, panel_title: e.target.value }))} placeholder="Titre du panneau" className="w-full border p-3 rounded-xl text-sm outline-none focus:border-[#B29071]" />
          <input value={form.section_1_title} onChange={(e) => setForm((p) => ({ ...p, section_1_title: e.target.value }))} placeholder="Titre section 1" className="w-full border p-3 rounded-xl text-sm outline-none focus:border-[#B29071]" />
        </div>
        <textarea value={form.section_1_content} onChange={(e) => setForm((p) => ({ ...p, section_1_content: e.target.value }))} placeholder="Contenu section 1" className="w-full border p-3 rounded-xl text-sm h-20 outline-none focus:border-[#B29071] resize-none" />

        <input value={form.section_2_title} onChange={(e) => setForm((p) => ({ ...p, section_2_title: e.target.value }))} placeholder="Titre section 2" className="w-full border p-3 rounded-xl text-sm outline-none focus:border-[#B29071]" />

        <div className="border border-gray-100 rounded-xl p-3 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => insertHtmlTag(contentRef, "h3")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">H3</button>
            <button type="button" onClick={() => insertHtmlTag(contentRef, "strong")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">Gras</button>
            <button type="button" onClick={() => insertHtmlTag(contentRef, "p")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">Paragraphe</button>
            <button type="button" onClick={() => insertHtmlTag(contentRef, "ul")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">Liste</button>
            <button type="button" onClick={() => insertRateTable(contentRef)} className="px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase">Tableau</button>
          </div>
          <textarea ref={contentRef} value={form.section_2_content_html} onChange={(e) => setForm((p) => ({ ...p, section_2_content_html: e.target.value }))} className="w-full border p-3 rounded-xl text-sm h-44 outline-none focus:border-[#B29071] font-mono" />
          <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-[#fcfaf8]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Aperçu</p>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.section_2_content_html || "" }} />
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-3 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => insertHtmlTag(notesRef, "p")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">Paragraphe</button>
            <button type="button" onClick={() => insertHtmlTag(notesRef, "strong")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">Gras</button>
            <button type="button" onClick={() => insertHtmlTag(notesRef, "ul")} className="px-3 py-1.5 rounded-lg bg-gray-100 text-[10px] font-bold uppercase">Liste</button>
          </div>
          <textarea ref={notesRef} value={form.notes_html} onChange={(e) => setForm((p) => ({ ...p, notes_html: e.target.value }))} placeholder="Notes finales" className="w-full border p-3 rounded-xl text-sm h-28 outline-none focus:border-[#B29071] font-mono" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-[#B29071]">Tarifs de livraison</p>
          <button onClick={addRate} className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
          </button>
        </div>

        <div className="space-y-3">
          {rates.map((rate) => (
            <div key={rate.$id} className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.3fr_0.8fr_0.9fr_80px_150px] gap-3 border border-gray-100 rounded-xl p-3 items-center">
              <input value={rate.zone} onChange={(e) => updateRateLocal(rate.$id, "zone", e.target.value)} className="border p-2.5 rounded-lg text-sm outline-none focus:border-[#B29071]" placeholder="Zone" />
              <input value={rate.lead_time} onChange={(e) => updateRateLocal(rate.$id, "lead_time", e.target.value)} className="border p-2.5 rounded-lg text-sm outline-none focus:border-[#B29071]" placeholder="Délais" />
              <input value={rate.shipping_fee} onChange={(e) => updateRateLocal(rate.$id, "shipping_fee", e.target.value)} className="border p-2.5 rounded-lg text-sm outline-none focus:border-[#B29071]" placeholder="Frais" />
              <input value={rate.free_from} onChange={(e) => updateRateLocal(rate.$id, "free_from", e.target.value)} className="border p-2.5 rounded-lg text-sm outline-none focus:border-[#B29071]" placeholder="Offert à partir de" />
              <input type="number" value={rate.sort_order} onChange={(e) => updateRateLocal(rate.$id, "sort_order", Number(e.target.value))} className="border p-2.5 rounded-lg text-sm outline-none focus:border-[#B29071]" placeholder="Ordre" />
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => updateRateLocal(rate.$id, "active", !rate.active)} className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase ${rate.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {rate.active ? "Actif" : "Inactif"}
                </button>
                <button onClick={() => saveRate(rate)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><Save className="w-4 h-4" /></button>
                <button onClick={() => deleteRate(rate.$id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {rates.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl text-sm text-gray-400">
              Aucun tarif configuré
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
