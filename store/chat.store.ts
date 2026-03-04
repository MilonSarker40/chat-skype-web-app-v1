import { create } from "zustand";
 
export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: number;
}
 
interface Friend {
  id: string;
  name: string;
  image?: string;
}
 
interface ChatState {
  ws: WebSocket | null;
  messages: Record<string, ChatMessage[]>;
  friends: Friend[];
 
  setFriends: (friends: Friend[]) => void;
  addMessage: (otherUserId: string, msg: ChatMessage) => void;
  setHistory: (otherUserId: string, msgs: ChatMessage[]) => void;
 
  connectSocket: (token: string) => void;
  disconnectSocket: () => void; // 🔥 added
}
 
export const useChatStore = create<ChatState>((set, get) => ({
  ws: null,
  messages: {},
  friends: [],
 
  setFriends: (friends) => set({ friends }),
 
  addMessage: (otherUserId, msg) =>
    set((state) => {
      const existing = state.messages[otherUserId] || [];
 
      // prevent duplicate
      if (existing.some((m) => m.id === msg.id)) return state;
 
      return {
        messages: {
          ...state.messages,
          [otherUserId]: [...existing, msg],
        },
      };
    }),
 
  setHistory: (otherUserId, msgs) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [otherUserId]: msgs,
      },
    })),
 
  connectSocket: (token) => {
    if (get().ws) return; // prevent multiple sockets
 
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS}${token}`
    );
 
    ws.onopen = () => {
      console.log("✅ WS Connected");
    };
 
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
 
      if (data.type === "NEW_MESSAGE") {
        const msg = data.message;
 
        const myId = JSON.parse(
          atob(token.split(".")[1])
        ).userId;
 
        const otherUserId =
          msg.from === myId ? msg.to : msg.from;
 
        get().addMessage(otherUserId, msg);
      }
    };
 
    ws.onclose = () => {
      console.log("❌ WS Closed");
      set({ ws: null });
    };
 
    ws.onerror = (err) => {
      console.log("WS Error", err);
    };
 
    set({ ws });
  },
 
  // 🔥 Proper logout cleanup
  disconnectSocket: () => {
    const ws = get().ws;
 
    if (ws) {
      ws.close();
    }
 
    set({
      ws: null,
      messages: {},
      friends: [],
    });
  },
}));
 