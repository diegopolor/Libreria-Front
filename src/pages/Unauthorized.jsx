import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 p-4 rounded-full text-red-500 mb-6 animate-bounce">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Acceso Denegado</h1>
      <p className="text-slate-500 max-w-md mb-8">
        No tienes permisos suficientes para acceder a esta sección del sistema.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 shadow-md shadow-brand-500/20 transition-all"
      >
        Volver al Panel de Control
      </Link>
    </div>
  );
}
