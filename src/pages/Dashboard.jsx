import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../context/authStore.js';
import api from '../services/api.js';
import { BookOpen, ClipboardList, Layers, Users, ChevronRight, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ booksCount: 0, availableCopies: 0, categoriesCount: 0, activeLoansCount: 0, queueCount: 0, usersCount: 0 });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const booksRes = await api.get('/books');
        const books = booksRes.data;
        const booksCount = books.length;
        const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
        const categoriesRes = await api.get('/categories');
        const categoriesCount = categoriesRes.data.length;
        const loansRes = await api.get('/loans');
        const activeLoansCount = loansRes.data.filter((l) => l.status === 'ACTIVE').length;
        const historyRes = await api.get('/loans/history');
        setRecentHistory(historyRes.data.slice(0, 4));
        let queueCount = 0;
        let usersCount = 0;
        if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') {
          const queueRes = await api.get('/loans/queue');
          queueCount = queueRes.data.length;
        }
        if (user.role === 'ADMIN') {
          const usersRes = await api.get('/users');
          usersCount = usersRes.data.length;
        }
        setStats({ booksCount, availableCopies, categoriesCount, activeLoansCount, queueCount, usersCount });
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Títulos Únicos', value: stats.booksCount, desc: `${stats.availableCopies} copias disponibles`, icon: BookOpen, color: 'bg-blue-500 text-blue-500', link: '/books' },
    { title: 'Categorías Temáticas', value: stats.categoriesCount, desc: 'Clasificadas dinámicamente', icon: Layers, color: 'bg-purple-500 text-purple-500', link: '/books' },
    { title: 'Préstamos Activos', value: stats.activeLoansCount, desc: 'En posesión de alumnos', icon: ClipboardList, color: 'bg-emerald-500 text-emerald-500', link: '/loans' },
  ];

  if (user.role === 'ADMIN' || user.role === 'LIBRARIAN')
    cards.push({ title: 'Solicitudes en Cola', value: stats.queueCount, desc: 'Procesamiento FIFO', icon: Clock, color: 'bg-amber-500 text-amber-500', link: '/loans' });
  if (user.role === 'ADMIN')
    cards.push({ title: 'Usuarios Totales', value: stats.usersCount, desc: 'Estudiantes y Personal', icon: Users, color: 'bg-indigo-500 text-indigo-500', link: '/users' });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Hola, {user.name} 👋</h2>
          <p className="text-slate-500 mt-1">{user.role === 'CLIENT' ? 'Consulta libros y gestiona tus préstamos.' : 'Controla el stock y las solicitudes en cola.'}</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium self-start md:self-auto">
          <CheckCircle className="h-4 w-4 shrink-0 animate-bounce" /><span>Sistema en Línea</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover-lift transition-all">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-sm font-medium text-slate-500 block">{card.title}</span>
                  <span className="text-3xl font-extrabold text-slate-900 block">{card.value}</span>
                  <span className="text-xs text-slate-400 block">{card.desc}</span>
                </div>
                <div className={`p-3 rounded-2xl ${card.color.split(' ')[0]}/10 ${card.color.split(' ')[1]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Actividad Reciente</h3>
              <p className="text-xs text-slate-400">Pila LIFO de transacciones en tiempo real</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center space-x-1">
              <span>Ver Historial</span><ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentHistory.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No hay actividad registrada en la pila.</p>
            ) : (
              recentHistory.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex space-x-3">
                    <div className={`p-2 rounded-xl text-xs font-bold uppercase ${item.action === 'BOOK_RETURNED' ? 'bg-emerald-500/10 text-emerald-600' : item.action === 'LOAN_APPROVED' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {item.action === 'BOOK_RETURNED' ? 'DEV' : item.action === 'LOAN_APPROVED' ? 'PREST' : 'SOLIC'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.book.title}</p>
                      <p className="text-xs text-slate-500">{item.details}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 font-medium whitespace-nowrap pl-4">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-brand-500 mb-4">
              <TrendingUp className="h-5 w-5" /><h3 className="text-lg font-bold text-slate-900">Políticas y Reglas</h3>
            </div>
            <div className="space-y-4 text-sm text-slate-500">
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-2xl">
                <span className="font-bold text-slate-800 block text-xs mb-1">1. Cola FIFO para Préstamos</span>
                Si un libro no posee copias, las solicitudes entran en cola. La aprobación es por estricto orden de llegada.
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="font-bold text-slate-800 block text-xs mb-1">2. Devoluciones Automáticas</span>
                Al devolver un libro, el sistema recalcula el stock y auto-aprueba la solicitud de la cola FIFO que corresponda.
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                <span className="font-bold text-slate-800 block text-xs mb-1">3. Historial (Pila LIFO)</span>
                El historial almacena cronológicamente los eventos, mostrando siempre el movimiento más reciente arriba.
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-50 mt-6 text-center text-xs text-slate-400">BiblioTech v1.0.0 • React & Node & Prisma</div>
        </div>
      </div>
    </div>
  );
}
