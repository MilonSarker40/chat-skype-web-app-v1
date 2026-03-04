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

      await api.post("/auth/create-skype-user", data)

      alert("User created successfully")

      window.location.href = "/login"

    } catch (err: any) {
      alert(err.response?.data?.message || "Register failed")
    } finally {
      set({ loading: false })
    }
  },

  login: async (data) => {
    try {
      set({ loading: true })

      const res = await api.post("/auth/skypelogin", data)

      const token = res.data.token

      localStorage.setItem("token", token)
      localStorage.setItem("email", res.data.user.email)

      set({
        user: res.data.user,
        token,
      })

      window.location.href = "/"

    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed")
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("email")

    window.location.href = "/login"
  },
}))