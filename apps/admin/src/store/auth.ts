import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        Cookies.set('admin_token', token, { expires: 7 });
        set({ user, token });
      },

      logout: () => {
        Cookies.remove('admin_token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'voyagenest-admin-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

