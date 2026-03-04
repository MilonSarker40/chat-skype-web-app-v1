"use client"
import { create } from "zustand"

export interface ChatMessage {
  id: string
  from: string
  to: string
  text: string
  createdAt: number
}

interface State {
  ws: WebSocket | null
  messages: Record<string, ChatMessage[]>

  connectSocket: (token: string) => void
  sendMessage: (to: string, text: string) => void
  addMessage: (user: string, msg: ChatMessage) => void
  setHistory: (user: string, msgs: ChatMessage[]) => void
}

export const useChatStore = create<State>((set, get) => ({

  ws: null,
  messages: {},

  connectSocket: (token) => {

    if (get().ws) return

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS}${token}`
    )

    ws.onopen = () => {
      console.log("WS Connected")
    }

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (data.type === "NEW_MESSAGE") {

        const msg = data.message
        const myEmail = localStorage.getItem("email")

        const otherUser =
          msg.from === myEmail ? msg.to : msg.from

        get().addMessage(otherUser, msg)

      }

    }

    ws.onclose = () => {
      set({ ws: null })
    }

    set({ ws })
  },

  addMessage: (user, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [user]: [...(state.messages[user] || []), msg],
      },
    })),

  setHistory: (user, msgs) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [user]: msgs,
      },
    })),

  sendMessage: (to, text) => {

    const ws = get().ws
    const myEmail = localStorage.getItem("email")

    if (!ws || !myEmail) return

    const tempMsg = {
      id: Date.now().toString(),
      from: myEmail,
      to,
      text,
      createdAt: Date.now(),
    }

    get().addMessage(to, tempMsg)

    ws.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        to,
        text,
      })
    )

  },

}))