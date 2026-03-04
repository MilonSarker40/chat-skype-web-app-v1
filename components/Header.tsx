"use client"

import { Search, Video, PhoneCall, EllipsisVertical } from "lucide-react"
import { useFriendStore } from "@/store/friendStore"

export default function Header() {

  const { activeFriendName } = useFriendStore()

  return (

    <div className="w-full h-[80px] bg-white border-b px-10 flex items-center justify-between">

      <div className="flex items-center gap-4">

        <img
          src={`https://ui-avatars.com/api/?name=${activeFriendName || "User"}`}
          className="w-10 h-10 rounded-lg"
        />

        <p className="font-semibold">
          {activeFriendName || "Select Friend"}
        </p>

      </div>

      <div className="flex gap-7 text-gray-400">

        <PhoneCall className="text-orange-400" />
        <Video className="text-orange-400" />
        <Search />
        <EllipsisVertical />

      </div>

    </div>

  )

}