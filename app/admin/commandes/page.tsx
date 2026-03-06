"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { 
  Package, Truck, CheckCircle, Clock, Trash2, Loader2, 
  MessageCircle, Mail, User, Phone, CheckCircle2, XCircle, Gift, ChevronLeft, ChevronRight 
} from "lucide-react";

interface Order {
  $id: string;
  user_id: string;
  items: string;
  total: number;
  shipping_address: string;
  status: string;
  gift_message?: string; // NUEVO: Campo para el mensaje de regalo
  $createdAt: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [page, setPage] = useState(1); // NUEVO: Estado para paginación
  const [totalOrders, setTotalOrders] = useState(0);
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  const ORDERS_PER_PAGE = 10;

  useEffect(() => {
    fetchOrders();
  }, [page, filter]); // Recargar si cambia la página o el filtro

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  async function fetchOrders() {
    try {
      setLoading(true);
      
      // Filtros dinámicos
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(ORDERS_PER_PAGE),
        Query.offset((page - 1) * ORDERS_PER_PAGE)
      ];

      if (filter !== "tous") {
        queries.push(Query.equal("status", filter));
      }

      const response = await databases.listDocuments(DATABASE_ID, 'orders', queries);
      setTotalOrders(response.total);

      const enrichedOrders = await Promise.all(response.documents.map(async (doc: any) => {
        try {
          const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', doc.user_id);
          return {
            ...doc,
            clientName: profile.full_name || "Client",
            clientEmail: profile.email || "Pas d'email",
            clientPhone: profile.phone || "N/A"
          };
        } catch {
          return { ...doc, clientName: "Utilisateur inconnu" };
        }
      }));

      setOrders(enrichedOrders as any);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await databases.updateDocument(DATABASE_ID, 'orders', id, { status: newStatus });
      notify("Statut mis à jour", "success");
      fetchOrders();
    } catch (error) {
      notify("Erreur de permissions", "error");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Supprimer cette commande?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'orders', id);
      notify("Supprimé", "success");
      fetchOrders();
    } catch (error) {
      notify("Erreur lors de la suppression", "error");
    }
  };

  const sendWhatsAppNotification = (order: Order) => {
    if (!order.clientPhone) return;
    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const msg = `Bonjour ${order.clientName}, votre commande #${order.$id.slice(-5).toUpperCase()} chez Skineno a été expédiée !`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading && orders.length === 0) return (
    <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#B29071]" /></div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20 text-black">
      
      {notif.show && (
        <div className={`fixed bottom-10 right-10 z-50 px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 bg-white ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          <span className="text-xs font-bold uppercase">{notif.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end border-b pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-serif">Commandes</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">Gestion du flux de vente ({totalOrders})</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg text-[8px] font-bold uppercase">
          {["tous", "en attente", "expédié", "livré"].map(f => (
            <button key={f} onClick={() => {setFilter(f); setPage(1);}} className={`px-3 py-1.5 rounded-md transition-all ${filter === f ? "bg-white text-black shadow-sm" : "text-gray-400"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.$id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            
            {/* CLIENT INFO COMPACT */}
            <div className="md:w-60 bg-gray-50/30 p-5 border-r border-gray-100 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#B29071] text-white flex items-center justify-center font-bold text-[10px]">
                    {order.clientName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[120px]">{order.clientName}</p>
                    <p className="text-[9px] text-gray-400 uppercase">#{order.$id.slice(-5).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-2 text-gray-500 truncate"><Mail className="w-3 h-3 opacity-40" /> {order.clientEmail}</div>
                  <div className="flex items-center gap-2 text-gray-500"><Phone className="w-3 h-3 opacity-40" /> {order.clientPhone}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">Livraison</span>
                <p className="text-[10px] leading-tight text-gray-600 italic">{order.shipping_address}</p>
              </div>
            </div>

            {/* ORDER CONTENT COMPACT */}
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span className="text-[8px] font-bold text-[#B29071] uppercase tracking-widest bg-[#B29071]/5 px-2 py-0.5 rounded">Articles</span>
                  <p className="text-xs font-medium text-gray-700 pt-2 leading-relaxed">{order.items}</p>
                  
                  {/* MENSAJE DE REGALO (NUEVO) */}
                  {order.gift_message && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-[8px] font-bold text-amber-800 uppercase flex items-center gap-1">
                        <Gift className="w-2.5 h-2.5" /> Message de cadeau :
                      </p>
                      <p className="text-[10px] text-amber-900 mt-0.5 italic">"{order.gift_message}"</p>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-black">{order.total.toFixed(2)} <span className="text-[10px]">MAD</span></p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order.$id, e.target.value)}
                  className={`text-[9px] font-bold uppercase p-2 rounded-lg outline-none border transition-all cursor-pointer w-full sm:w-auto ${
                    order.status === "en attente" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    order.status === "expédié" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-green-50 text-green-600 border-green-100"
                  }`}
                >
                  <option value="en attente">⌛ En attente</option>
                  <option value="expédié">🚚 Expédié</option>
                  <option value="livré">✅ Livré</option>
                </select>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {order.status === "expédié" && (
                    <button 
                        onClick={() => sendWhatsAppNotification(order)} 
                        className="flex-1 sm:flex-none flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-[9px] font-bold uppercase rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                  )}
                  <button onClick={() => deleteOrder(order.$id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN (NUEVO) */}
      {totalOrders > ORDERS_PER_PAGE && (
        <div className="flex justify-center items-center gap-6 pt-6">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-full border border-gray-200 disabled:opacity-20 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Page {page} / {Math.ceil(totalOrders / ORDERS_PER_PAGE)}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalOrders / ORDERS_PER_PAGE)}
            className="p-2 rounded-full border border-gray-200 disabled:opacity-20 hover:bg-gray-50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
          <Package className="w-10 h-10 text-gray-100 mx-auto mb-3" />
          <p className="text-gray-400 text-xs italic">Aucune commande trouvée.</p>
        </div>
      )}
    </div>
  );
}