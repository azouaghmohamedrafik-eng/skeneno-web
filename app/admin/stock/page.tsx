"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID } from "@/appwriteConfig";
import { Query } from "appwrite";
import { Loader2, Search, Plus, Minus, CheckCircle2, AlertTriangle, Package } from "lucide-react";

interface ProductStock {
  $id: string;
  name: string;
  stock: number;
}

export default function StockManagementPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notif, setNotif] = useState({ show: false, msg: "" });

  useEffect(() => {
    fetchStock();
  }, []);

  async function fetchStock() {
    try {
      setLoading(true);
      const res = await databases.listDocuments(DATABASE_ID, 'products', [Query.orderAsc('name')]);
      setProducts(res.documents.map((d: any) => ({
        $id: d.$id,
        name: d.name,
        stock: d.stock || 0
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStock = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(id);
    try {
      await databases.updateDocument(DATABASE_ID, 'products', id, { stock: newStock });
      setProducts(products.map(p => p.$id === id ? { ...p, stock: newStock } : p));
      setNotif({ show: true, msg: "Stock mis à jour" });
      setTimeout(() => setNotif({ show: false, msg: "" }), 2000);
    } catch (e) {
      alert("Erreur de mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#B29071]" /></div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up text-black">
      
      {notif.show && (
        <div className="fixed bottom-10 right-10 z-50 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-[#B29071]" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{notif.msg}</span>
        </div>
      )}

      <div className="border-b pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-serif">Gestion Logistique</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">Contrôle rapide des quantités en stock</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 p-3 pl-10 rounded-xl text-xs outline-none focus:border-[#B29071] shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-[10px] font-bold uppercase text-gray-400">
            <tr>
              <th className="p-6">Produit</th>
              <th className="p-6 text-center">Quantité Actuelle</th>
              <th className="p-6 text-right">Actions Rapides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.map((p) => (
              <tr key={p.$id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6">
                  <p className="text-sm font-bold text-gray-800">{p.name}</p>
                  {p.stock === 0 && (
                    <span className="text-[8px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit mt-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> RUPTURE DE STOCK
                    </span>
                  )}
                </td>
                <td className="p-6 text-center">
                  <span className={`text-lg font-mono font-bold ${p.stock < 5 ? 'text-red-500' : 'text-gray-800'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-end items-center gap-4">
                    {updatingId === p.$id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#B29071]" />
                    ) : (
                      <>
                        <button 
                          onClick={() => handleUpdateStock(p.$id, p.stock - 1)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStock(p.$id, p.stock + 1)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center text-gray-300 italic text-sm">Aucun produit trouvé.</div>
        )}
      </div>
    </div>
  );
}