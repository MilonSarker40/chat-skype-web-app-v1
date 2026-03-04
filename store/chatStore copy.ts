"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ChatMessage {
  id: string
  from: string
  to: string
  text: string
  createdAt: number
}

interface Friend {
  email: string
  name: string
  image?: string
}

interface ChatState {
  ws: WebSocket | null
  messages: Record<string, ChatMessage[]>
  friends: Friend[]
  activeChat: string | null
  loading: boolean

  setActiveChat: (email: string) => void
  setFriends: (friends: Friend[]) => void
  fetchFriends: (token: string) => Promise<void>

  addMessage: (otherUserId: string, msg: ChatMessage) => void
  setHistory: (otherUserId: string, msgs: ChatMessage[]) => void

  connectSocket: (token: string) => void
  sendMessage: (to: string, text: string) => void
  disconnectSocket: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ws: null,
      messages: {},
      friends: [],
      activeChat: null,
      loading: false,

      setActiveChat: (email) =>
        set({ activeChat: email }),

      setFriends: (friends) =>
        set({ friends }),

      fetchFriends: async (token) => {
        if (!token) return

        try {
          set({ loading: true })

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/my-friends/skype`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          const data = await res.json()

          if (res.ok) {
            set({ friends: data })
          }
        } catch (err) {
          console.log("Friend fetch error", err)
        } finally {
          set({ loading: false })
        }
      },

      addMessage: (otherUserId, msg) =>
        set((state) => {
          const existing =
            state.messages[otherUserId] || []

          if (existing.some((m) => m.id === msg.id))
            return state

          return {
            messages: {
              ...state.messages,
              [otherUserId]: [
                ...existing,
                msg,
              ],
            },
          }
        }),

      setHistory: (otherUserId, msgs) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [otherUserId]: msgs,
          },
        })),

      connectSocket: (token) => {
        if (get().ws) return

        const ws = new WebSocket(
          `${process.env.NEXT_PUBLIC_WS}${token}`
        )

        ws.onopen = () => {
          console.log("✅ WS Connected")
        }

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)

          if (data.type === "NEW_MESSAGE") {
            const msg = data.message

            const myId = JSON.parse(
              atob(token.split(".")[1])
            ).userId

            const otherUserId =
              msg.from === myId
                ? msg.to
                : msg.from

            get().addMessage(
              otherUserId,
              msg
            )
          }
        }

        ws.onclose = () => {
          set({ ws: null })
        }

        ws.onerror = (err) => {
          console.log("WS error", err)
        }

        set({ ws })
      },

      sendMessage: (to, text) => {
        const ws = get().ws
        if (!ws) return

        ws.send(
          JSON.stringify({
            type: "SEND_MESSAGE",
            to,
            text,
          })
        )
      },

      disconnectSocket: () => {
        const ws = get().ws
        if (ws) ws.close()

        set({
          ws: null,
          messages: {},
          friends: [],
          activeChat: null,
        })
      },
    }),
    {
      name: "chat-storage",
    }
  )
)