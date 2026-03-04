export default function MessageBubble({
  msg,
  activeChat,
}: any) {
  const isMe = msg.from !== activeChat

  return (
    <div
      className={`flex ${
        isMe
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`px-5 py-3 max-w-[340px] text-sm ${
          isMe
            ? "bg-[#f97316] text-white rounded-[18px] rounded-br-md"
            : "bg-[#e9e9eb] rounded-[18px] rounded-bl-md"
        }`}
      >
        {msg.text}
      </div>
    </div>
  )
}