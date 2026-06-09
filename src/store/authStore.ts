import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false, // We'll set this when querying 'me' on mount if needed
      login: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem('auth-storage');
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      // only persist token and user, not isLoading
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
