"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { 
  Package, Truck, CheckCircle, Clock, Trash2, Loader2, 
  MessageCircle, Mail, User, Phone, CheckCircle2, XCircle, Gift, ChevronLeft, ChevronRight, ShoppingBag 
} from "lucide-react";

interface Order {
  $id: string;
  user_id: string;
  items: string;
  items_json?: string;
  total: number;
  shipping_address: string;
  status: string;
  gift_message?: string; // Campo para el mensaje de la tarjeta de regalo
  $createdAt: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  coupon_code?: string;
  discount_total?: number;
  subtotal_before_discount?: number;
  stock_deducted?: boolean;
  stock_deducted_at?: string | null;
}

interface OrderItemRow {
  product_id: string;
  quantity: number;
  isGift?: boolean;
  item_type?: "product" | "packaging";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [page, setPage] = useState(1); 
  const [totalOrders, setTotalOrders] = useState(0);
  const [notif, setNotif] = useState({ show: false, msg: "", type: "success" as "success" | "error" });

  const ORDERS_PER_PAGE = 10;

  useEffect(() => {
    fetchOrders();
  }, [page, filter]); 

  const notify = (msg: string, type: "success" | "error") => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
  };

  async function fetchOrders() {
    try {
      setLoading(true);
      
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
            ...doc, // Incluye gift_message de la tabla orders
            clientName: profile.full_name || "Client Inconnu", // Nombre completo del perfil
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

  const parseOrderItems = (order: Order): OrderItemRow[] => {
    if (!order.items_json) return [];
    try {
      const parsed = JSON.parse(order.items_json);
      if (!Array.isArray(parsed)) return [];
      const normalized: OrderItemRow[] = parsed.map((row: any): OrderItemRow => ({
          product_id: String(row?.product_id || ""),
          quantity: Number(row?.quantity || 0),
          isGift: Boolean(row?.isGift),
          item_type: row?.item_type === "packaging" ? "packaging" : "product"
        }));
      return normalized.filter((row) => row.product_id.length > 0 && row.quantity > 0);
    } catch {
      return [];
    }
  };

  const buildStockMap = (items: OrderItemRow[]) => {
    const stockItems = items.filter((row) =>
      row.item_type !== "packaging" &&
      !row.isGift &&
      row.product_id !== "gift_box" &&
      row.product_id !== "gift_bag"
    );
    const qtyById = new Map<string, number>();
    stockItems.forEach((row) => {
      qtyById.set(row.product_id, (qtyById.get(row.product_id) || 0) + row.quantity);
    });
    return qtyById;
  };

  const applyStockChange = async (qtyById: Map<string, number>, mode: "deduct" | "restore") => {
    const productIds = Array.from(qtyById.keys());
    if (productIds.length === 0) return;
    const productsRes = await databases.listDocuments(DATABASE_ID, 'products', [
      Query.equal("$id", productIds),
      Query.limit(200)
    ]);
    const productMap = new Map<string, any>();
    productsRes.documents.forEach((p: any) => productMap.set(p.$id, p));
    for (const productId of productIds) {
      const qty = qtyById.get(productId) || 0;
      const product = productMap.get(productId);
      if (!product) {
        throw new Error(`Produit introuvable: ${productId}`);
      }
      const currentStock = Number(product.stock || 0);
      if (mode === "deduct" && currentStock < qty) {
        throw new Error(`Stock insuffisant pour ${product.name || productId}`);
      }
    }
    for (const productId of productIds) {
      const qty = qtyById.get(productId) || 0;
      const product = productMap.get(productId);
      const currentStock = Number(product.stock || 0);
      const nextStock = mode === "deduct" ? currentStock - qty : currentStock + qty;
      await databases.updateDocument(DATABASE_ID, 'products', productId, {
        stock: nextStock
      });
    }
  };

  const updateStatus = async (order: Order, newStatus: string) => {
    try {
      const parsedItems = parseOrderItems(order);
      const hasStructuredItems = parsedItems.length > 0;
      const shouldDeductStock = newStatus === "expédié" || newStatus === "livré";

      if (shouldDeductStock && !order.stock_deducted && hasStructuredItems) {
        const qtyById = buildStockMap(parsedItems);
        await applyStockChange(qtyById, "deduct");
        await databases.updateDocument(DATABASE_ID, 'orders', order.$id, {
          status: newStatus,
          stock_deducted: true,
          stock_deducted_at: new Date().toISOString()
        });
      } else if (newStatus === "en attente" && order.stock_deducted && hasStructuredItems) {
        const qtyById = buildStockMap(parsedItems);
        await applyStockChange(qtyById, "restore");
        await databases.updateDocument(DATABASE_ID, 'orders', order.$id, {
          status: newStatus,
          stock_deducted: false,
          stock_deducted_at: null
        });
      } else if ((shouldDeductStock || newStatus === "en attente") && !hasStructuredItems) {
        if (newStatus === "en attente" && order.stock_deducted) {
          notify("Commande ancienne sans items_json: restauration de stock impossible.", "error");
          return;
        }
        await databases.updateDocument(DATABASE_ID, 'orders', order.$id, { status: newStatus });
        if (shouldDeductStock) {
          notify("Commande ancienne mise à jour sans déduction auto de stock.", "success");
          fetchOrders();
          return;
        }
      } else {
        await databases.updateDocument(DATABASE_ID, 'orders', order.$id, { status: newStatus });
      }
      notify("Statut mis à jour", "success");
      fetchOrders();
    } catch (error) {
      const errMsg = (error as any)?.message || "Erreur de mise à jour";
      notify(errMsg, "error");
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
            
            {/* INFO CLIENT (NOM COMPLET) */}
            <div className="md:w-60 bg-gray-50/30 p-5 border-r border-gray-100 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#B29071] text-white flex items-center justify-center font-bold text-[10px]">
                    {order.clientName?.charAt(0)}
                  </div>
                  {/* CORRECCIÓN: Quitada la clase 'truncate' y 'max-w-[120px]' para mostrar el nombre entero */}
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-tight break-words">{order.clientName}</p>
                    <p className="text-[9px] text-gray-400 uppercase mt-0.5">#{order.$id.slice(-5).toUpperCase()}</p>
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

            {/* CONTENU DE LA COMMANDE ET MESSAGE CADEAU */}
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span className="text-[8px] font-bold text-[#B29071] uppercase tracking-widest bg-[#B29071]/5 px-2 py-0.5 rounded">Articles</span>
                  <div className="pt-2 space-y-2">
                    {order.items.split(",").map((raw, idx) => {
                      const t = raw.trim();
                      const isGift = /\(OFFERT\)/i.test(t);
                      const isBox = /Coffret Cadeau/i.test(t);
                      const isBag = /(Pochette Cadeau|Sac Cadeau)/i.test(t);
                      return (
                        <div 
                          key={idx} 
                          className={`flex justify-between items-center text-xs ${isGift ? "text-amber-700 font-bold" : "text-gray-700"}`}
                        >
                          <span className="flex items-center gap-2">
                            {isGift ? <Gift className="w-3.5 h-3.5" /> : isBox ? <Package className="w-3.5 h-3.5" /> : isBag ? <ShoppingBag className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-gray-300" />}
                            {t.replace(/\s*\(OFFERT\)\s*/i, "").trim()}
                          </span>
                          <span className="text-[10px]">{isGift ? "OFFERT" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* VISUALIZACIÓN DEL MESSAGE CADEAU */}
                  {order.gift_message && order.gift_message.trim() !== "" && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-[8px] font-bold text-amber-800 uppercase flex items-center gap-1.5 mb-1">
                        <Gift className="w-3 h-3" /> Message pour la carte cadeau :
                      </p>
                      <p className="text-[11px] text-amber-900 italic leading-relaxed">
                        "{order.gift_message}"
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="space-y-1">
                    {typeof order.subtotal_before_discount === "number" && order.subtotal_before_discount > 0 && (
                      <p className="text-xs text-gray-500">Sous-total: {order.subtotal_before_discount.toFixed(2)} MAD</p>
                    )}
                    {typeof order.discount_total === "number" && order.discount_total > 0 && (
                      <p className="text-xs text-green-600 font-bold">
                        {order.coupon_code ? `Coupon ${order.coupon_code}: ` : "Remise: "}
                        -{order.discount_total.toFixed(2)} MAD
                      </p>
                    )}
                    <p className="text-lg font-bold text-black">{order.total.toFixed(2)} <span className="text-[10px]">MAD</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order, e.target.value)}
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

      {/* PAGINACIÓN */}
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
