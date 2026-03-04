import {
  MessageCircle,
  Phone,
  Users,
  SlidersHorizontal,
  Bell,
  LogOut,
} from "lucide-react"

import Image from "next/image"

export default function IconBar() {
  return (
    <div className="w-[72px] bg-white border-r border-[#ebebeb] flex flex-col items-center py-8">

      <div className="mb-14">
        <Image
          src="/images/logo.png"
          width={56}
          height={55}
          alt="Logo"
        />
      </div>

      <div className="flex flex-col gap-10 text-gray-400">
        <MessageCircle size={22} />
        <Phone size={22} />
        <Users size={22} />
        <SlidersHorizontal size={22} />
        <Bell size={22} />
      </div>

      <div className="mt-auto mb-6">
        <LogOut size={22} className="text-gray-400" />
      </div>
    </div>
  )
}