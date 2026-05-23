import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuthStore } from '../context/authStore.js';
import { Users, Plus, Edit, Trash2, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'CLIENT', password: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) { setError('Error al cargar los usuarios.'); } finally { setLoading(false); }
  };

  const handleOpenCreateModal = () => { setEditingUser(null); setFormData({ name: '', email: '', role: 'CLIENT', password: '' }); setFormErrors({}); setShowModal(true); };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setFormErrors({}); setShowModal(true);
  };

  const handleFormChange = (e) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value })); };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'El nombre es obligatorio.';
    if (!formData.email) errors.email = 'El correo es obligatorio.';
    if (!editingUser && !formData.password) errors.password = 'La contraseña es obligatoria.';
    else if (formData.password && formData.password.length < 6) errors.password = 'Mínimo 6 caracteres.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        showSuccessMessage('Usuario actualizado exitosamente.');
      } else {
        await api.post('/users', formData);
        showSuccessMessage('Usuario creado exitosamente.');
      }
      setShowModal(false); fetchUsers();
    } catch (err) { setFormErrors({ server: err.response?.data?.message || 'Error al guardar el usuario.' }); }
  };

  const handleDeleteUser = async (id) => {
    if (currentUser.id === id) { setError('No puedes eliminar tu propio usuario.'); setTimeout(() => setError(''), 4000); return; }
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await api.delete(`/users/${id}`);
      showSuccessMessage('Usuario eliminado exitosamente.'); fetchUsers();
    } catch (err) { setError(err.response?.data?.message || 'No se pudo eliminar el usuario.'); setTimeout(() => setError(''), 4000); }
  };

  const showSuccessMessage = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Usuarios</h2>
          <p className="text-slate-500 mt-1">Crea, edita y administra los roles de los usuarios del sistema.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-500/20 cursor-pointer self-start sm:self-auto">
          <Plus className="h-5 w-5" /><span>Nuevo Usuario</span>
        </button>
      </div>

      {success && (<div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /><span>{success}</span></div>)}
      {error && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm"><AlertCircle className="h-5 w-5 text-red-500 shrink-0" /><span>{error}</span></div>)}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent"></div></div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm"><Users className="h-12 w-12 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800">No hay Usuarios</h3></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-5">Nombre / Correo</th><th className="p-5">Rol</th><th className="p-5">Fecha Registro</th><th className="p-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5"><p className="font-bold text-slate-900">{u.name}</p><p className="text-xs text-slate-500 mt-0.5">{u.email}</p></td>
                    <td className="p-5">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'LIBRARIAN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        <Shield className="h-3.5 w-3.5" /><span>{u.role}</span>
                      </span>
                    </td>
                    <td className="p-5 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleOpenEditModal(u)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 rounded-xl transition-colors cursor-pointer"><Edit className="h-4 w-4" /></button>
                        {currentUser.id !== u.id && (<button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>)}
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
              <h3 className="text-lg font-bold text-slate-900">{editingUser ? 'Editar Cuenta' : 'Nueva Cuenta de Usuario'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formErrors.server && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs"><AlertCircle className="h-4 w-4 shrink-0 text-red-500" /><span>{formErrors.server}</span></div>)}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Ej. Ana Belén" className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                {formErrors.name && <span className="text-xs text-red-500 block mt-1">{formErrors.name}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="ana@universidad.edu" className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                {formErrors.email && <span className="text-xs text-red-500 block mt-1">{formErrors.email}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder={editingUser ? 'Dejar en blanco para no modificar' : 'Mínimo 6 caracteres'} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                {formErrors.password && <span className="text-xs text-red-500 block mt-1">{formErrors.password}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rol en el Sistema</label>
                <select name="role" value={formData.role} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm bg-white">
                  <option value="CLIENT">Cliente / Estudiante</option>
                  <option value="LIBRARIAN">Bibliotecario</option>
                  <option value="ADMIN">Administrador del Sistema</option>
                </select>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 font-medium rounded-xl transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer">Guardar Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
