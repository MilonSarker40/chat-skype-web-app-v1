import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  email: string;
  name: string;

  token: string | null;

  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: "",
      name: "",
      token: null,

      setEmail: (email) => set({ email }),
      setName: (name) => set({ name }),
      setToken: (token) => set({ token }),

      logout: () => {
        set({
          email: "",
          name: "",
          token: null,
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);