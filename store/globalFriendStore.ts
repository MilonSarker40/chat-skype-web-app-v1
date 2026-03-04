"use client"
import { create } from "zustand"
import { api } from "@/lib/axios"
import { useFriendStore } from "./friendStore"

interface User {
  email: string
  name: string
  isFriend: boolean
  isRequestSent: boolean
  isIncomingRequest: boolean
}

interface State {
  users: User[]
  loading: boolean

  searchUsers: (query: string) => Promise<void>
  sendRequest: (email: string) => Promise<void>
  acceptRequest: (email: string) => Promise<void>
}

export const useGlobalFriendStore = create<State>((set) => ({
  users: [],
  loading: false,

  searchUsers: async (query) => {
    try {
      const res = await api.get("/users/friends/skype")

      const filtered = res.data.filter((u: any) =>
        u.name.toLowerCase().includes(query.toLowerCase())
      )

      set({ users: filtered })
    } catch (err) {
      console.log("Search error", err)
    }
  },

  sendRequest: async (email) => {
    try {
      await api.post(`/users/skyperequest/${email}`)

      set((state) => ({
        users: state.users.map((u) =>
          u.email === email ? { ...u, isRequestSent: true } : u
        ),
      }))
    } catch (err) {
      console.log(err)
    }
  },

  acceptRequest: async (email) => {
    try {
      await api.post(`/users/accept-skyperequest/${email}`)

      useFriendStore.getState().fetchFriends()

      set((state) => ({
        users: state.users.map((u) =>
          u.email === email ? { ...u, isFriend: true } : u
        ),
      }))
    } catch (err) {
      console.log(err)
    }
  },
}))