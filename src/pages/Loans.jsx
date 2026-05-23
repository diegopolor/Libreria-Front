import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuthStore } from '../context/authStore.js';
import { Clock, CheckCircle, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

export default function Loans() {
  const { user } = useAuthStore();
  const [loans, setLoans] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isStaff = user.role === 'ADMIN' || user.role === 'LIBRARIAN';

  useEffect(() => {
    fetchLoans();
    if (isStaff) fetchQueue();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans');
      setLoans(res.data);
    } catch (err) {
      setError('Error al cargar la lista de préstamos.');
    } finally { setLoading(false); }
  };

  const fetchQueue = async () => {
    try {
      const res = await api.get('/loans/queue');
      setQueue(res.data);
    } catch (err) { console.error('Error fetching queue:', err); }
  };

  const handleReturn = async (loanId) => {
    try {
      await api.post(`/loans/${loanId}/return`);
      showSuccessMessage('Libro devuelto exitosamente. Cola FIFO procesada.');
      fetchLoans();
      if (isStaff) fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la devolución.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.post(`/loans/requests/${requestId}/approve`);
      showSuccessMessage('Solicitud aprobada con éxito. Préstamo generado.');
      fetchLoans(); fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo aprobar la solicitud.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/loans/requests/${requestId}/reject`);
      showSuccessMessage('Solicitud rechazada y eliminada de la cola FIFO.');
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo rechazar la solicitud.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const showSuccessMessage = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4500); };

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
  const pastLoans = loans.filter((l) => l.status === 'RETURNED');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Préstamos y Devoluciones</h2>
        <p className="text-slate-500 mt-1">{isStaff ? 'Monitorea libros prestados y aprueba solicitudes en espera FIFO.' : 'Revisa tus libros en posesión e historial de vencimiento.'}</p>
      </div>

      {success && (<div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /><span>{success}</span></div>)}
      {error && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm"><AlertCircle className="h-5 w-5 text-red-500 shrink-0" /><span>{error}</span></div>)}

      {isStaff && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2"><Clock className="h-5 w-5 text-amber-500 animate-spin" /><span>Cola FIFO de Solicitudes Pendientes</span></h3>
            <p className="text-xs text-slate-400 mt-0.5">Las solicitudes se ordenan cronológicamente. El primero en llegar tiene prioridad.</p>
          </div>
          {queue.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No hay solicitudes en la cola FIFO actualmente.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Usuario</th><th className="p-4">Libro</th><th className="p-4">Fecha Solicitud</th><th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                  {queue.map((req, idx) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4"><p className="font-bold text-slate-800">{req.user.name}</p><p className="text-xs text-slate-400">{req.user.email}</p></td>
                      <td className="p-4 font-semibold text-slate-700">{req.book.title}</td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {new Date(req.createdAt).toLocaleString()}
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full text-[10px]">Posición #{idx + 1}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleApproveRequest(req.id)} className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer">Aprobar</button>
                          <button onClick={() => handleRejectRequest(req.id)} className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer">Rechazar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Libros Actualmente Prestados</h3>
        {loading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-500 border-t-transparent"></div></div>
        ) : activeLoans.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No hay préstamos activos registrados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeLoans.map((loan) => {
              const isOverdue = new Date(loan.dueDate) < new Date();
              return (
                <div key={loan.id} className={`p-5 rounded-2xl border transition-all ${isOverdue ? 'border-red-200 bg-red-50/20' : 'border-slate-100 bg-slate-50/10'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div><h4 className="font-bold text-slate-900">{loan.book.title}</h4><p className="text-xs text-slate-500">{loan.book.author}</p></div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOverdue ? 'bg-red-500 text-white' : 'bg-brand-500 text-white'}`}>{isOverdue ? 'Vencido' : 'Activo'}</span>
                  </div>
                  {isStaff && (<div className="mb-4 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100"><p className="font-bold text-slate-700">Lector: {loan.user.name}</p><p className="text-slate-400 mt-0.5">{loan.user.email}</p></div>)}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-medium">
                    <div className="flex items-center space-x-1"><Calendar className="h-4 w-4 text-slate-400" /><span>{new Date(loan.loanDate).toLocaleDateString()}</span></div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div className="flex items-center space-x-1"><Calendar className="h-4 w-4 text-slate-400" /><span className={isOverdue ? 'text-red-600 font-bold' : ''}>{new Date(loan.dueDate).toLocaleDateString()}</span></div>
                  </div>
                  {isStaff && (<button onClick={() => handleReturn(loan.id)} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer">Registrar Devolución</button>)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Historial de Libros Devueltos</h3>
        {pastLoans.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No hay registros de devoluciones anteriores.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Usuario</th><th className="p-4">Libro</th><th className="p-4">Fecha Préstamo</th><th className="p-4">Fecha Devolución</th><th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {pastLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4"><p className="font-semibold">{loan.user.name}</p><p className="text-xs text-slate-400">{loan.user.email}</p></td>
                    <td className="p-4 font-semibold text-slate-800">{loan.book.title}</td>
                    <td className="p-4 text-xs text-slate-500">{new Date(loan.loanDate).toLocaleDateString()}</td>
                    <td className="p-4 text-xs text-slate-500 font-medium">{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold uppercase">Devuelto</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
