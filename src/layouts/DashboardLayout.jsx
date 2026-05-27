import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore.js';
import { BookOpen, Users, Layers, History, ClipboardList, LogOut, Menu, X, LayoutDashboard, User } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard, roles: ['ADMIN', 'LIBRARIAN', 'CLIENT'] },
    { to: '/books', label: 'Catálogo de Libros', icon: BookOpen, roles: ['ADMIN', 'LIBRARIAN', 'CLIENT'] },
    { to: '/categories', label: 'Categorías', icon: Layers, roles: ['ADMIN', 'LIBRARIAN'] },
    { to: '/loans', label: 'Préstamos y Devoluciones', icon: ClipboardList, roles: ['ADMIN', 'LIBRARIAN', 'CLIENT'] },
    { to: '/history', label: 'Historial / Auditoría', icon: History, roles: ['ADMIN', 'LIBRARIAN', 'CLIENT'] },
    { to: '/users', label: 'Gestión de Usuarios', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-900 text-white shadow-md">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-brand-300" />
          <span className="font-bold tracking-wide">BiblioTech</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-brand-800 focus:outline-none">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-950 text-slate-100 flex flex-col justify-between transition-transform duration-300 transform md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="p-6 border-b border-brand-900 flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-brand-300 animate-pulse" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">BiblioTech</h1>
              <span className="text-xs text-brand-400">Sistema Universitario</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20' : 'text-slate-400 hover:bg-brand-900 hover:text-slate-100'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-brand-900 bg-brand-950/50">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="bg-brand-800 p-2 rounded-xl text-brand-300"><User className="h-5 w-5" /></div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-brand-400 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-950/30 hover:bg-red-900/40 text-red-200 border border-red-900/50 rounded-xl transition-colors text-sm font-medium">
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"></div>}

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
}
