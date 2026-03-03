"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { 
  Package, Truck, CheckCircle, Clock, Trash2, Loader2, 
  MessageCircle, Mail, User, Phone, CheckCircle2, XCircle 
} from "lucide-react";

interface Order {
  $id: string;
  user_id: string;
  items: string;
  total: number;
  shipping_address: string;
  status: string;
  $createdAt: string;
  // Mapeo con tu tabla profiles real
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  useEffect(() => {
    fetchOrders();
  }, []);

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  async function fetchOrders() {
    try {
      setLoading(true);
      // Traemos los últimos 10 pedidos
      const response = await databases.listDocuments(DATABASE_ID, 'orders', [
        Query.orderDesc('$createdAt'),
        Query.limit(10)
      ]);

      // Enriquecemos los datos buscando en la tabla 'profiles'
      const enrichedOrders = await Promise.all(response.documents.map(async (doc: any) => {
        try {
          const profile: any = await databases.getDocument(DATABASE_ID, 'profiles', doc.user_id);
          return {
            ...doc,
            clientName: profile.full_name || "Client", // Usando full_name de tu captura
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
      notify("Erreur de permissions. Activez 'Update' en Appwrite Settings.", "error");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Supprimer cette commande?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, 'orders', id);
      setOrders(orders.filter(o => o.$id !== id));
      notify("Supprimé", "success");
    } catch (error) {
      notify("Erreur lors de la suppression", "error");
    }
  };

  const sendWhatsAppNotification = (order: Order) => {
    if (!order.clientPhone) return;
    const cleanPhone = order.clientPhone.replace(/\D/g, ''); // Limpiar espacios y signos
    const msg = `Bonjour ${order.clientName}, votre commande #${order.$id.slice(-5).toUpperCase()} chez Skineno a été expédiée !`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredOrders = filter === "tous" ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#B29071]" /></div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up pb-20 text-black">
      
      {notif.show && (
        <div className={`fixed bottom-10 right-10 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 bg-white ${notif.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'}`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="text-sm font-bold uppercase">{notif.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end border-b pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-serif">Commandes</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">Gestion du flux de vente</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl text-[9px] font-bold uppercase">
          {["tous", "en attente", "expédié", "livré"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg transition-all ${filter === f ? "bg-white text-black shadow-sm" : "text-gray-400"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.$id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            
            {/* CLIENT INFO */}
            <div className="md:w-72 bg-gray-50/50 p-6 border-r border-gray-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B29071]/10 flex items-center justify-center text-[#B29071] font-bold text-xs">
                    {order.clientName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[150px]">{order.clientName}</p>
                    <p className="text-[10px] text-gray-400 uppercase">#{order.$id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 opacity-40" /> {order.clientEmail}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 opacity-40" /> {order.clientPhone}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Destinataire</span>
                <p className="text-[11px] leading-relaxed text-gray-600 italic">{order.shipping_address}</p>
              </div>
            </div>

            {/* ORDER CONTENT */}
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#B29071] uppercase tracking-widest bg-[#B29071]/5 px-2 py-0.5 rounded">Panier</span>
                  <p className="text-sm font-medium text-gray-800 pt-2 leading-relaxed">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-black">{order.total.toFixed(2)} <span className="text-xs">DHS</span></p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order.$id, e.target.value)}
                  className={`text-[10px] font-bold uppercase p-3 rounded-xl outline-none border transition-all cursor-pointer w-full sm:w-auto ${
                    order.status === "en attente" ? "bg-amber-50 text-amber-600 border-amber-100" :
                    order.status === "expédié" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-green-50 text-green-600 border-green-100"
                  }`}
                >
                  <option value="en attente">⌛ En attente</option>
                  <option value="expédié">🚚 Expédié</option>
                  <option value="livré">✅ Livré</option>
                </select>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {order.status === "expédié" && (
                    <button 
                        onClick={() => sendWhatsAppNotification(order)} 
                        className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-3 bg-green-600 text-white text-[10px] font-bold uppercase rounded-xl shadow-lg shadow-green-100 hover:scale-105 transition-transform"
                    >
                      <MessageCircle className="w-4 h-4" /> Envoyer WhatsApp
                    </button>
                  )}
                  <button onClick={() => deleteOrder(order.$id)} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}