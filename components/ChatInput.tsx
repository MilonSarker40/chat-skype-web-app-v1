"use client"

import { useState } from "react"
import { useChatStore } from "@/store/chatStore"
import { useFriendStore } from "@/store/friendStore"

export default function ChatInput() {

  const [text, setText] = useState("")

  const { sendMessage } = useChatStore()
  const { activeChat } = useFriendStore()

  return (

    <div className="px-10 pb-8">

      <div className="h-[56px] bg-white border border-gray-300 rounded-xl flex items-center px-6">

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 outline-none"
          placeholder="Type a message"
        />

        <button
          disabled={!activeChat}
          onClick={() => {

            if (!activeChat || !text.trim()) return

            sendMessage(activeChat, text)

            setText("")

          }}
          className="w-9 h-9 bg-orange-500 rounded-full text-white"
        >
          ➤
        </button>

      </div>

    </div>
  )
}