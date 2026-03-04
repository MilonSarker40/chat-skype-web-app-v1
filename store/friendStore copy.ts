"use client"

import { create } from "zustand"
import { api } from "@/lib/axios"

export interface Friend {
  email: string
  name: string
}

interface State {
  friends: Friend[]
  activeChat: string | null

  fetchFriends: () => Promise<void>
  setActiveChat: (email: string) => void
}

export const useFriendStore = create<State>((set) => ({
  friends: [],
  activeChat: null,

  fetchFriends: async () => {
    try {
      const res = await api.get("/users/my-friends/skype")

      set({
        friends: res.data.friends || [],
      })
    } catch (err) {
      console.log("Friend fetch error", err)
    }
  },

  setActiveChat: (email) =>
    set({ activeChat: email }),
}))