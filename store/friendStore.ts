"use client"

import { create } from "zustand"
import { api } from "@/lib/axios"

export interface Friend {
  email: string
  name: string
  id: string
}

interface State {
  friends: Friend[]
  activeChat: string | null
  activeFriendName: string | null
  outCommingRequests: Friend[]
  incomingRequests: Friend[]
  fetchFriends: () => Promise<void>
  setActiveChat: (email: string, name: string) => void
  setOutCommingRequests: ()=> Promise<void>
  setIncomingRequests: ()=> Promise<void>
}

export const useFriendStore = create<State>((set) => ({
  friends: [],
  activeChat: null,
  activeFriendName: null,
  outCommingRequests: [],
  incomingRequests: [],

  fetchFriends: async () => {
    try {
      const res = await api.get("/users/my-friends/skype")

      set({
        friends: res.data.friends || [],
      })
    } catch (err) {
      console.log(err)
    }
  },

  setOutCommingRequests: async () => {
    try {
      const res = await api.get("/users/requests/sent/skype")

      set({
        outCommingRequests: res.data.requests || [],
      })
    } catch (err) {
      console.log(err)
    }
  },

  setIncomingRequests: async () => {
    try {
      const res = await api.get("/users/requests-list/skype")

      set({
        incomingRequests: res.data.requests || [],
      })
    } catch (err) {
      console.log(err)
    }
  },

  setActiveChat: (email, name) =>
    set({
      activeChat: email,
      activeFriendName: name,
    }),
}))