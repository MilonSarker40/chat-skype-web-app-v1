"use client"

import { useEffect } from "react"
import { useFriendStore } from "@/store/friendStore"

export default function Sidebar() {
  const { friends, fetchFriends, loading } =
    useFriendStore()

  useEffect(() => {
    fetchFriends()
  }, [])

  return (
    <div className="w-[360px] bg-white shadow-[1px_0px_0px_0px_#00000014] border-r border-[#ebebeb] px-6 py-6 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[18px] font-semibold text-gray-900">
          Messages
        </h1>

        <button className="w-9 h-9 rounded-full bg-[#f97316] text-white text-lg">
          +
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="search"
          className="w-full h-[44px] bg-[#f3f4f6] rounded-xl px-4 text-sm outline-none"
        />
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Friends
      </p>

      {/* Friend List */}
      {loading && (
        <p className="text-sm text-gray-400">
          Loading...
        </p>
      )}

      {friends.map((friend) => (
        <div
          key={friend._id}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f3f0eb] cursor-pointer transition"
        >
          <div className="relative">
            <img
              src={
                friend.profilePic ||
                "https://i.pravatar.cc/36"
              }
              className="w-[36px] h-[36px] rounded-lg object-cover"
            />

            {friend.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {friend.name}
              </p>
            </div>

            <p className="text-sm text-gray-500 truncate">
              {friend.email}
            </p>
          </div>
        </div>
      ))}

    </div>
  )
}