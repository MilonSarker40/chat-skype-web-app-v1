"use client"
import { create } from "zustand"
import { api } from "@/lib/axios"

interface AuthState {
  user: any
  token: string | null
  loading: boolean
  register: (data: any) => Promise<void>
  login: (data: any) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,

  register: async (data) => {
    try {
      set({ loading: true })

      const res = await api.post("/auth/create-skype-user", data)

      console.log("Register Success:", res.data)

      set({ loading: false })
      alert("User created successfully")
    } catch (err: any) {
      set({ loading: false })
      alert(err.response?.data?.message || "Register failed")
    }
  },

  login: async (data) => {
    try {
      set({ loading: true })

      const res = await api.post("/auth/skypelogin", data)

      const token = res.data.token

      localStorage.setItem("token", token)
      localStorage.setItem("email",res.data.user.email)
      localStorage.setItem("name",res.data.user.name)

      set({
        user: res.data.user,
        token,
        loading: false,
      })

      window.location.href = "/"
    } catch (err: any) {
      set({ loading: false })
      alert(err.response?.data?.message || "Login failed")
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    set({ user: null, token: null })
    window.location.href = "/login"
  },
}))