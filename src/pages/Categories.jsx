import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Layers, Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError('Error al cargar las categorías.');
    } finally { setLoading(false); }
  };

  const handleOpenCreateModal = () => { setEditingCategory(null); setName(''); setDescription(''); setFieldErrors({}); setShowModal(true); };
  const handleOpenEditModal = (cat) => { setEditingCategory(cat); setName(cat.name); setDescription(cat.description || ''); setFieldErrors({}); setShowModal(true); };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setFieldErrors({ name: 'El nombre es obligatorio.' }); return; }
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name, description });
        showSuccessMessage('Categoría actualizada exitosamente.');
      } else {
        await api.post('/categories', { name, description });
        showSuccessMessage('Categoría creada exitosamente.');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setFieldErrors({ server: err.response?.data?.message || 'Error al guardar la categoría.' });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      showSuccessMessage('Categoría eliminada exitosamente.');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la categoría.');
      setTimeout(() => setError(''), 4500);
    }
  };

  const showSuccessMessage = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Categorías</h2>
          <p className="text-slate-500 mt-1">Crea y modifica las categorías dinámicas del inventario.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-500/20 cursor-pointer self-start sm:self-auto">
          <Plus className="h-5 w-5" /><span>Nueva Categoría</span>
        </button>
      </div>

      {success && (<div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /><span>{success}</span></div>)}
      {error && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm"><AlertCircle className="h-5 w-5 text-red-500 shrink-0" /><span>{error}</span></div>)}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent"></div></div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm"><Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800">Sin Categorías</h3><p className="text-slate-400 mt-1">No hay categorías registradas.</p></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-5">Nombre</th><th className="p-5">Descripción</th><th className="p-5">Libros Asociados</th><th className="p-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-900">{cat.name}</td>
                    <td className="p-5 text-slate-500 max-w-xs truncate">{cat.description || 'Sin descripción'}</td>
                    <td className="p-5"><span className="px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-lg text-xs font-bold">{cat._count?.books || 0} libros</span></td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleOpenEditModal(cat)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 rounded-xl transition-colors cursor-pointer"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {fieldErrors.server && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs"><AlertCircle className="h-4 w-4 shrink-0 text-red-500" /><span>{fieldErrors.server}</span></div>)}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Programación Móvil" className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                {fieldErrors.name && <span className="text-xs text-red-500 block mt-1">{fieldErrors.name}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles sobre los libros de esta categoría..." rows="3" className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm"></textarea>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 font-medium rounded-xl transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
