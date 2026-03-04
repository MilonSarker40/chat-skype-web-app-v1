"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronLeft, FiSend } from "react-icons/fi";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/authStore";

function formatTime(date: number) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const userid = params.id as string;

  // const [token, setToken] = useState<string | null>(null)

  console.log("USER id ---- ", userid)

  const token = useAuthStore((s) => s.token);

  // useEffect(()=>{
  //  const token = localStorage.getItem('token')
  //  setToken(token)
  // },[])

  console.log("Token ---->", token)

  const {
    messages,
    setHistory,
    addMessage,
    connectSocket,
    ws,
    friends,
    setFriends,
  } = useChatStore();

  const chatMessages = messages[userid] || [];

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ===========================
     MY ID FROM TOKEN
  ============================ */
  const myId = useMemo(() => {
    if (!token) return "";
    try {
      return JSON.parse(atob(token.split(".")[1])).userId;
    } catch {
      return "";
    }
  }, [token]);

  /* ===========================
     FIND CHAT PARTNER
  ============================ */
  const chatPartner = useMemo(() => {
    return friends.find((f) => f.id === userid);
  }, [friends, userid]);

  /* ===========================
     FETCH FRIENDS (Refresh Safe)
  ============================ */
  useEffect(() => {
    if (!token) return;

    async function fetchFriends() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/my-friends/skype`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("Friend data:  ", data)

      if (res.ok) {
        setFriends(data.friends);
      }
    }

    fetchFriends();
  }, [token, setFriends]);

  /* ===========================
     CONNECT SOCKET
  ============================ */
  useEffect(() => {
    if (token) connectSocket(token);
  }, [token, connectSocket]);

  /* ===========================
     SUBSCRIBE TO CHAT
  ============================ */
  useEffect(() => {
    if (!ws || !userid) return;

    const subscribe = () => {
      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE_CHAT",
          with: userid,
        })
      );
    };

    if (ws.readyState === WebSocket.OPEN) {
      subscribe();
    }

    ws.addEventListener("open", subscribe);

    return () => {
      ws.removeEventListener("open", subscribe);
    };
  }, [ws, userid]);

  /* ===========================
     LOAD HISTORY
  ============================ */
  useEffect(() => {
    if (!userid || !token) return;

    async function loadHistory() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/history/skype?with=${userid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setHistory(userid, data);
      }
    }

    loadHistory();
  }, [userid, token, setHistory]);

  /* ===========================
     AUTO SCROLL
  ============================ */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ===========================
     SEND MESSAGE
  ============================ */
  async function sendMessage() {
    if (!text.trim() || !token) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/send/skype`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: userid,
          text,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      addMessage(userid, data);
      setText("");
    }
  }

  return (
    <div className="max-w-[479px] mx-auto h-screen flex flex-col bg-[#071F36] text-white relative">

      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 right-0 max-w-[479px] mx-auto bg-[#071F36] z-20 px-4 pt-6 pb-4 border-b border-white/10 flex justify-between items-center">

        <div className="flex items-center gap-1 cursor-pointer">
          <button onClick={() => router.back()}>
            <FiChevronLeft size={24} />
          </button>

          <h2 className="text-lg font-semibold">
            {chatPartner?.name || "Chat"}
          </h2>
        </div>

        <img
          src={
            chatPartner?.image
              ? `${process.env.NEXT_PUBLIC_API_URL}${chatPartner.image}`
              : "/images/profile-img.png"
          }
          alt="avatar"
          className="rounded-full w-9 h-9 object-cover"
        />
      </div>

      {/* ================= MESSAGE AREA ================= */}
      <div className="flex-1 overflow-y-auto px-4 pt-[90px] pb-[120px] space-y-4">
        {chatMessages.map((m) => {
          const isMe = m.from === myId;

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    isMe
                      ? "bg-[#244B6B] rounded-br-none"
                      : "bg-[#1E3A55] rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>

                <div
                  className={`text-[10px] text-gray-400 mt-1 ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="fixed bottom-10 left-0 right-0 max-w-[479px] mx-auto bg-[#071F36] border-t border-white/10 px-4 pt-6 pb-14 flex items-center gap-3">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#17324B] rounded-full px-4 py-3 outline-none text-sm"
        />

        <button
          onClick={sendMessage}
          className="bg-[#2E9BD3] p-3 rounded-full hover:bg-[#2589bd] transition"
        >
          <FiSend size={18} />
        </button>
      </div>

    </div>
  );
}