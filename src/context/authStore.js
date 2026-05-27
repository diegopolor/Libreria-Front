import { create } from 'zustand';

export const useAuthStore = create((set) => {
  const savedUser = localStorage.getItem('library_user');
  const savedAccess = localStorage.getItem('library_access_token');
  const savedRefresh = localStorage.getItem('library_refresh_token');
  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    accessToken: savedAccess || null,
    refreshToken: savedRefresh || null,
    isAuthenticated: !!savedAccess,
    login: (user, accessToken, refreshToken) => {
      localStorage.setItem('library_user', JSON.stringify(user));
      localStorage.setItem('library_access_token', accessToken);
      localStorage.setItem('library_refresh_token', refreshToken);
      set({ user, accessToken, refreshToken, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('library_user');
      localStorage.removeItem('library_access_token');
      localStorage.removeItem('library_refresh_token');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
    updateUser: (updatedUser) => {
      localStorage.setItem('library_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    },
  };
});
