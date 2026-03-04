"use client"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"

export default function Register() {
  const { register, loading } = useAuthStore()

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  })

  const handleSubmit = (e: any) => {
    e.preventDefault()
    register(form)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-[400px]"
      >
        <h2 className="text-xl font-semibold mb-6">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-lg"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-sm mt-4">
          Already have account?{" "}
          <Link href="/login" className="text-orange-500">
            Login
          </Link>
        </p>
      </form>

    </div>
  )
}