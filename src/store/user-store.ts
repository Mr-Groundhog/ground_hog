import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  nickname: string | null;
  avatar: string | null;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoaded: false,

  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const result = await res.json();
        set({ user: result.data, isAuthenticated: true, isLoaded: true });
      } else {
        set({ user: null, isAuthenticated: false, isLoaded: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoaded: true });
    }
  },

  logout: () => {
    window.location.href = '/api/logto/sign-out';
  },

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}));
