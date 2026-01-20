import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cookieUtils } from '@/lib/cookies';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  token?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Set token to cookie
        cookieUtils.setToken(token);
        set({ user: { ...user, token }, isAuthenticated: true });
      },
      logout: () => {
        // Remove token from cookie
        cookieUtils.removeToken();
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
    }
  )
);
