import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore.js';
import { BookOpen, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Por favor complete todos los campos.'); return; }
    setError(''); setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      loginStore(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally { setLoading(false); }
  };

  const handleQuickFill = (roleEmail, rolePass) => { setEmail(roleEmail); setPassword(rolePass); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500/10 rounded-2xl text-brand-400 mb-4 border border-brand-500/20">
            <BookOpen className="h-10 w-10 animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">BiblioTech</h2>
          <p className="text-slate-400 mt-2 text-sm">Ingresa a tu cuenta universitaria de biblioteca</p>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Mail className="h-5 w-5" /></span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@biblioteca.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="h-5 w-5" /></span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-medium rounded-2xl transition-all shadow-lg btn-premium-shadow flex items-center justify-center space-x-2 text-base cursor-pointer">
              {loading ? (<><Loader2 className="h-5 w-5 animate-spin" /><span>Iniciando sesión...</span></>) : (<span>Ingresar al Sistema</span>)}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <span className="block text-center text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Acceso Rápido (Universidad)</span>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleQuickFill('admin@biblioteca.com', 'admin123')} className="px-2 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer">Admin</button>
              <button onClick={() => handleQuickFill('librarian@biblioteca.com', 'librarian123')} className="px-2 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer">Bibliotecario</button>
              <button onClick={() => handleQuickFill('client@biblioteca.com', 'client123')} className="px-2 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer">Cliente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
