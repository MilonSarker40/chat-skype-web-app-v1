"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useFriendStore } from "@/store/friendStore"
import { useGlobalFriendStore } from "@/store/globalFriendStore"
import { useAuthStore } from "@/store/authStore"
import { useChatStore } from "@/store/chat.store"

export default function Sidebar() {

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  const token = useAuthStore((s) => s.token)

  const connectSocket = useChatStore((s) => s.connectSocket)

  const {
    friends,
    fetchFriends,
    setActiveChat,
    activeChat,
    incomingRequests,
    setIncomingRequests,
    outCommingRequests,
    setOutCommingRequests
  } = useFriendStore()

  const {
    users,
    searchUsers,
    sendRequest,
    acceptRequest,
    loading
  } = useGlobalFriendStore()

  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  useEffect(()=>{
  if (!token) return

  setIncomingRequests()
  setOutCommingRequests()

  },[token])

  useEffect(() => {

  function handleClickOutside(event: MouseEvent) {

    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setShowSearch(false)
    }

  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }

}, [])

  /* =========================
     FETCH FRIENDS
  ========================= */
  useEffect(() => {
    fetchFriends()
  }, [])

  /* =========================
     INIT WEBSOCKET
  ========================= */
  useEffect(() => {

    if (!token) return

    connectSocket(token)

  }, [token, connectSocket])


  const handleSearch = (value: string) => {

    setSearch(value)

    if (value.length === 0) {
      searchUsers("")
      return
    }

    if (value.length >= 1) {
      searchUsers(value)
    }
  }

  return (

    <div className="w-[360px] bg-white shadow-[1px_0px_0px_0px_#00000014] px-6 py-6 overflow-y-auto relative">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-[18px] font-semibold text-gray-900">
          Messages
        </h1>

        <button className="w-9 h-9 rounded-full bg-[#f97316] text-white flex items-center justify-center">
          +
        </button>

      </div>


      {/* SEARCH */}
      <div ref={searchRef} className="mb-6 relative">

        <input
          value={search}
          onFocus={() => {
            setShowSearch(true)
            searchUsers("")
          }}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full h-[44px] bg-[#f3f4f6] rounded-xl px-4 text-sm outline-none text-gray-500"
        />

        {showSearch && (

          <div className="absolute top-[50px] left-0 w-full bg-white rounded-xl border shadow-xl z-50 max-h-[260px] overflow-y-auto">

            {loading && (
              <div className="p-4 text-center text-sm text-gray-400">
                Searching...
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">
                No users found
              </div>
            )}

            {users.map((user) => (

              <div
                key={user.id}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b hover:bg-gray-50"
              >

                {/* USER INFO */}
                <div className="flex items-center gap-3">

                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}`}
                    className="w-9 h-9 rounded-full"
                  />

                  <div>

                    <p className="text-sm font-semibold text-gray-600">
                      {user.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {user.email}
                    </p>

                  </div>

                </div>


                {/* ACTION BUTTONS */}
                <div>

                  {user.isFriend && (

                    <button
                      onClick={() => {

                        setActiveChat(user.id, user.name)

                        router.push(`/chat/${user.id}`)

                        setShowSearch(false)
                        setSearch("")
                      }}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-full"
                    >
                      Chat
                    </button>

                  )}

                  {user.isIncomingRequest && (

                    <button
                      onClick={() => acceptRequest(user.email)}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full"
                    >
                      Accept
                    </button>

                  )}

                  {user.isRequestSent && (

                    <span className="text-xs text-orange-500">
                      Requested
                    </span>

                  )}

                  {!user.isFriend &&
                    !user.isRequestSent &&
                    !user.isIncomingRequest && (

                      <button
                        onClick={() => sendRequest(user.email)}
                        className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full"
                      >
                        Add
                      </button>

                    )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* FILTER */}
      <div className="flex gap-3 mb-8">

        <button className="px-4 py-1.5 text-sm rounded-full bg-orange-500 text-white">
          All
        </button>

        <button className="px-4 py-1.5 text-sm rounded-full bg-gray-400">
          Unread
        </button>

        <button className="px-4 py-1.5 text-sm rounded-full bg-gray-400">
          Groups
        </button>

      </div>


      {/* FRIEND LIST */}
      <p className="text-xs text-gray-400 mb-4">
        My Friends
      </p>


      {friends.length === 0 && (

        <div className="text-center text-sm text-gray-400 py-10">
          No friends yet
        </div>

      )}

      {incomingRequests.length > 0 && (

        <div className="mb-6">

          <p className="text-xs text-gray-400 mb-2">
            Incoming Requests
          </p>

          {incomingRequests.map((friend) => (

            <div
              key={friend.id}
              onClick={() => acceptRequest(friend.email)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition hover:bg-[#f3f0eb]`}
            >

              <img
                src={`https://ui-avatars.com/api/?name=${friend.name}`}
                className="w-[36px] h-[36px] rounded-full"
              />

              <div>

                <p className="text-sm font-semibold text-gray-500">
                  {friend.name}
                </p>

                <p className="text-xs text-gray-400">
                  Accept
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

      {friends.map((friend) => (

        <div
          key={friend.id}
          onClick={() => {

            setActiveChat(friend.id, friend.name)

            router.push(`/chat/${friend.id}`)

          }}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition ${
            activeChat === friend.id
              ? "bg-[#f3f0eb]"
              : "hover:bg-[#f3f0eb]"
          }`}
        >

          <img
            src={`https://ui-avatars.com/api/?name=${friend.name}`}
            className="w-[36px] h-[36px] rounded-full"
          />

          <div>

            <p className="text-sm font-semibold text-gray-500">
              {friend.name}
            </p>

            <p className="text-xs text-gray-400">
              Click to chat
            </p>

          </div>

        </div>

      ))}

    </div>

  )
}