"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiChevronLeft, FiSend } from "react-icons/fi";
import { useChatStore } from "@/store/chat.store";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

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

  const token = useAuthStore((s) => s.token);

  const {
    messages,
    setHistory,
    addMessage,
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
     FETCH FRIENDS (fallback)
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

      if (res.ok) {
        setFriends(data.friends);
      }

    }

    if (friends.length === 0) {
      fetchFriends();
    }

  }, [token, setFriends, friends.length]);



  /* ===========================
     SUBSCRIBE CHAT
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
    } else {
      ws.addEventListener("open", subscribe);
    }

    return () => {

      ws.removeEventListener("open", subscribe);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "UNSUBSCRIBE_CHAT",
            with: userid,
          })
        );
      }

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

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

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

  <div className="flex flex-col h-full bg-[#f5f5f5]">

  {/* HEADER */}
  <div className="h-[70px] px-6 flex items-center justify-between border-b bg-white">

    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
       <Image src="/icons/avater.png"
       width={40}
       height={40}
       alt="Avatar"
       className="rounded-lg"
       />
      </div>

      <div>
        <p className="font-semibold text-gray-800">
          {chatPartner?.name || "Chat"}
        </p>

        <p className="text-xs text-gray-500">
          Online
        </p>
      </div>

    </div>

    <div className="flex items-center gap-6 text-gray-600 text-lg">

      <span><Image src="/call.svg" width={20} height={20} alt="Phone" /></span>
      <span><Image src="/Video.svg" width={20} height={20} alt="Video Call" /></span>
      {/* <span>🔍</span>
      <span>⋮</span> */}

    </div>

  </div>


  {/* MESSAGES */}
  <div className="flex-1 overflow-y-auto px-10 py-6 space-y-6">

    {chatMessages.map((m) => {

      const isMe = m.from === myId;

      return (

        <div
          key={m.id}
          className={`flex items-end gap-3 ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >

          {!isMe && (
            <img
              src="/icons/avater.png"
              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center"
            />
          )}

          <div
            className={`max-w-[420px] px-5 py-3 rounded-2xl text-sm ${
              isMe
                ? "bg-orange-500 text-white rounded-br-md"
                : "bg-gray-200 text-gray-800 rounded-bl-md"
            }`}
          >

            {m.text}

            <div
              className={`text-[11px] mt-1 ${
                isMe
                  ? "text-orange-100 text-right"
                  : "text-gray-500"
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


  {/* INPUT BAR */}
  <div className="h-[80px] px-8 flex items-center border-t bg-white">

    <div className="flex items-center w-full gap-4">

      <button className="text-xl text-gray-500">
       <Image src="/attached.svg" width={20} height={20} alt="Emoji" />
      </button>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        className="relative flex-1 border-2 border-gray-300 rounded-2xl px-6 py-3 outline-none text-sm text-black"
      />

      <button
        onClick={sendMessage}
        className="absolute right-8 w-11 h-11 flex items-center justify-center rounded-full text-white"
      >
        <span><Image src="/sent.svg" width={20} height={20} alt="Send" /></span>
      </button>

    </div>

  </div>

</div>
  );
}