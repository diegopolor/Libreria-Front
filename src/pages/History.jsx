import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuthStore } from '../context/authStore.js';
import { History, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/history');
      setHistory(res.data);
    } catch (err) { console.error('Error fetching history:', err); } finally { setLoading(false); }
  };

  const isStaff = user.role === 'ADMIN' || user.role === 'LIBRARIAN';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Historial de Transacciones (Pila LIFO)</h2>
        <p className="text-slate-500 mt-1">
          {isStaff
            ? 'Historial de auditoría completo del sistema. Los eventos se ordenan en una pila LIFO (el más reciente arriba).'
            : 'Tu historial de movimientos en la biblioteca, ordenado en una pila LIFO.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent"></div></div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
          <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Historial Vacío</h3>
          <p className="text-slate-400 mt-1">No hay eventos registrados en la pila.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 bg-brand-950 text-white p-6 rounded-3xl border border-brand-900 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-brand-300">Esquema de la Pila</h4>
              <p className="text-xs text-brand-400 leading-relaxed">
                El sistema simula una <strong>Pila LIFO (Last-In, First-Out)</strong>. Las transacciones se &quot;apilan&quot; (push) al ocurrir y se visualizan desde el tope hacia abajo.
              </p>
              <div className="space-y-2 pt-4">
                <div className="border border-dashed border-brand-700 p-2.5 rounded-xl text-center text-xs font-bold bg-brand-900/40 text-emerald-400">▲ Tope de la Pila (Top)</div>
                <div className="h-12 border border-brand-900/50 p-2.5 rounded-xl text-center text-xs flex items-center justify-center bg-brand-900/10 text-slate-400">Última acción</div>
                <div className="h-12 border border-brand-900/50 p-2.5 rounded-xl text-center text-xs flex items-center justify-center bg-brand-900/10 text-slate-500">Acciones previas...</div>
                <div className="border border-dashed border-brand-700 p-2.5 rounded-xl text-center text-xs font-bold bg-brand-900/40 text-brand-400">▼ Fondo de la Pila (Bottom)</div>
              </div>
            </div>
            <div className="pt-6 border-t border-brand-900 mt-6 flex items-center space-x-2 text-xs text-brand-400">
              <AlertCircle className="h-4 w-4 text-brand-300 shrink-0" /><span>Acceso LIFO certificado.</span>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8">
              {history.map((item, idx) => {
                const isTop = idx === 0;
                return (
                  <div key={item.id} className="relative">
                    <span className={`absolute -left-[35px] top-1.5 flex items-center justify-center rounded-full w-6 h-6 border-2 transition-all ${isTop ? 'bg-emerald-500 border-emerald-100 text-white animate-pulse' : 'bg-white border-slate-300 text-slate-400'}`}>
                      {isTop ? '▲' : '•'}
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.action === 'BOOK_RETURNED' ? 'bg-emerald-100 text-emerald-800' : item.action === 'LOAN_APPROVED' ? 'bg-blue-100 text-blue-800' : item.action === 'LOAN_REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {item.action}
                        </span>
                        {isTop && (<span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-extrabold uppercase rounded">TOPE DE LA PILA</span>)}
                        <span className="text-xs text-slate-400 font-medium">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="font-bold text-slate-800">{item.book.title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.details}</p>
                      {isStaff && (<p className="text-xs text-slate-400 pt-1">Generado por: <span className="font-semibold text-slate-500">{item.user.name}</span> ({item.user.email})</p>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
