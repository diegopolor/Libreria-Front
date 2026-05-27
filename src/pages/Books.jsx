import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuthStore } from '../context/authStore.js';
import { Filter, Plus, Edit, Trash2, Layers, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function Books() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filters, setFilters] = useState({ title: '', author: '', editorial: '', categoryId: '', edition: '', year: '', sortBy: 'title', sortOrder: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({ title: '', author: '', editorial: '', edition: '', publicationDate: '', isbn: '', totalCopies: 1, categoryId: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { fetchCategories(); fetchBooks(); }, [filters]);

  const fetchCategories = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data); } catch (err) { console.error('Error fetching categories:', err); }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => { if (val) queryParams.append(key, val); });
      const res = await api.get(`/books?${queryParams.toString()}`);
      setBooks(res.data);
    } catch (err) { setError('No se pudieron cargar los libros.'); } finally { setLoading(false); }
  };

  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters((prev) => ({ ...prev, [name]: value })); };
  const toggleSort = (field) => { setFilters((prev) => ({ ...prev, sortBy: field, sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc' })); };

  const openCreateModal = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', editorial: '', edition: '', publicationDate: '', isbn: '', totalCopies: 1, categoryId: categories[0]?.id || '' });
    setFormErrors({}); setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author, editorial: book.editorial, edition: book.edition, publicationDate: new Date(book.publicationDate).toISOString().split('T')[0], isbn: book.isbn, totalCopies: book.totalCopies, categoryId: book.categoryId });
    setFormErrors({}); setShowModal(true);
  };

  const handleFormChange = (e) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: name === 'totalCopies' ? parseInt(value) || 0 : value })); };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'El título es obligatorio.';
    if (!formData.author) errors.author = 'El autor es obligatorio.';
    if (!formData.editorial) errors.editorial = 'La editorial es obligatoria.';
    if (!formData.edition) errors.edition = 'La edición es obligatoria.';
    if (!formData.publicationDate) errors.publicationDate = 'La fecha es obligatoria.';
    if (!formData.isbn) errors.isbn = 'El ISBN es obligatorio.';
    if (!formData.categoryId) errors.categoryId = 'La categoría es obligatoria.';
    if (formData.totalCopies < 1) errors.totalCopies = 'Debe haber al menos 1 copia.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingBook) { await api.put(`/books/${editingBook.id}`, formData); showSuccessMessage('Libro actualizado exitosamente.'); }
      else { await api.post('/books', formData); showSuccessMessage('Libro creado exitosamente.'); }
      setShowModal(false); fetchBooks();
    } catch (err) { setFormErrors({ server: err.response?.data?.message || 'Error al guardar el libro.' }); }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este libro?')) return;
    try { await api.delete(`/books/${id}`); showSuccessMessage('Libro eliminado exitosamente.'); fetchBooks(); }
    catch (err) { setError(err.response?.data?.message || 'No se pudo eliminar el libro.'); setTimeout(() => setError(''), 4000); }
  };

  const handleRequestLoan = async (bookId) => {
    try {
      const res = await api.post('/loans/request', { bookId });
      const { loan } = res.data;
      showSuccessMessage(loan ? '¡Préstamo aprobado al instante! Recoge tu libro.' : 'Solicitud encolada. Estás en la lista de espera FIFO.');
      fetchBooks();
    } catch (err) { setError(err.response?.data?.message || 'Error al solicitar el préstamo.'); setTimeout(() => setError(''), 4000); }
  };

  const showSuccessMessage = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };
  const isStaff = user.role === 'ADMIN' || user.role === 'LIBRARIAN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Catálogo de Libros</h2>
          <p className="text-slate-500 mt-1">Busca, filtra y solicita libros del inventario.</p>
        </div>
        {isStaff && (
          <button onClick={openCreateModal} className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-all shadow-md shadow-brand-500/20 cursor-pointer self-start sm:self-auto">
            <Plus className="h-5 w-5" /><span>Agregar Libro</span>
          </button>
        )}
      </div>

      {success && (<div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /><span>{success}</span></div>)}
      {error && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm"><AlertCircle className="h-5 w-5 text-red-500 shrink-0" /><span>{error}</span></div>)}

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-brand-700 font-semibold mb-2"><Filter className="h-5 w-5" /><span>Filtros de Búsqueda</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[['title','Título','Buscar título...','text'],['author','Autor','Buscar autor...','text'],['editorial','Editorial','Buscar editorial...','text']].map(([field,label,ph,type]) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} name={field} value={filters[field]} onChange={handleFilterChange} placeholder={ph} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm text-slate-800" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Categoría</label>
            <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm text-slate-800">
              <option value="">Todas</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          {[['edition','Edición','Buscar edición...','text'],['year','Año','Año...','number']].map(([field,label,ph,type]) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} name={field} value={filters[field]} onChange={handleFilterChange} placeholder={ph} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm text-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent"></div></div>
      ) : books.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm"><Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800">Catálogo Vacío</h3><p className="text-slate-400 mt-1 max-w-sm mx-auto">No se encontraron libros que coincidan con la búsqueda.</p></div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-5 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => toggleSort('title')}>
                    <div className="flex items-center space-x-1"><span>Título / Autor</span>{filters.sortBy === 'title' && (filters.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}</div>
                  </th>
                  <th className="p-5">Editorial / Edición</th>
                  <th className="p-5 cursor-pointer hover:text-brand-500 transition-colors" onClick={() => toggleSort('publicationDate')}>
                    <div className="flex items-center space-x-1"><span>Publicación</span>{filters.sortBy === 'publicationDate' && (filters.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}</div>
                  </th>
                  <th className="p-5">Categoría</th><th className="p-5">Disponibilidad</th><th className="p-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5"><p className="font-bold text-slate-900">{book.title}</p><p className="text-xs text-slate-500 mt-0.5">{book.author}</p></td>
                    <td className="p-5"><p className="font-medium text-slate-800">{book.editorial}</p><p className="text-xs text-slate-400 mt-0.5">{book.edition}</p></td>
                    <td className="p-5 text-xs font-medium text-slate-500">{new Date(book.publicationDate).toLocaleDateString([], { year: 'numeric', month: 'long' })}</td>
                    <td className="p-5"><span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold">{book.category.name}</span></td>
                    <td className="p-5">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${book.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>{book.availableCopies} de {book.totalCopies} copias</span>
                        {book._count && book._count.loanRequests > 0 && (<p className="text-[10px] text-amber-500 font-bold block">⚠️ {book._count.loanRequests} en cola FIFO</p>)}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {user.role === 'CLIENT' && (
                          <button onClick={() => handleRequestLoan(book.id)} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${book.availableCopies > 0 ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
                            {book.availableCopies > 0 ? 'Solicitar' : 'Hacer Cola'}
                          </button>
                        )}
                        {isStaff && (<>
                          <button onClick={() => openEditModal(book)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 rounded-xl transition-colors cursor-pointer"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                        </>)}
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editingBook ? 'Editar Libro' : 'Agregar Nuevo Libro'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formErrors.server && (<div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs"><AlertCircle className="h-4 w-4 shrink-0 text-red-500" /><span>{formErrors.server}</span></div>)}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Título</label>
                  <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.title && <span className="text-xs text-red-500 block mt-1">{formErrors.title}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Autor</label>
                  <input type="text" name="author" value={formData.author} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.author && <span className="text-xs text-red-500 block mt-1">{formErrors.author}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ISBN</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.isbn && <span className="text-xs text-red-500 block mt-1">{formErrors.isbn}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Editorial</label>
                  <input type="text" name="editorial" value={formData.editorial} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.editorial && <span className="text-xs text-red-500 block mt-1">{formErrors.editorial}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Edición</label>
                  <input type="text" name="edition" value={formData.edition} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.edition && <span className="text-xs text-red-500 block mt-1">{formErrors.edition}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha Publicación</label>
                  <input type="date" name="publicationDate" value={formData.publicationDate} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.publicationDate && <span className="text-xs text-red-500 block mt-1">{formErrors.publicationDate}</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Copias</label>
                  <input type="number" name="totalCopies" value={formData.totalCopies} onChange={handleFormChange} min="1" className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm" />
                  {formErrors.totalCopies && <span className="text-xs text-red-500 block mt-1">{formErrors.totalCopies}</span>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoría</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleFormChange} className="w-full px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-brand-500 rounded-xl text-sm bg-white">
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                  {formErrors.categoryId && <span className="text-xs text-red-500 block mt-1">{formErrors.categoryId}</span>}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 font-medium rounded-xl transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer">Guardar Libro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
