"use client"
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"

export default function Login() {
  const { login, loading } = useAuthStore()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = (e: any) => {
    e.preventDefault()
    login(form)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-[400px]"
      >
        <h2 className="text-xl font-semibold mb-6">
          Login
        </h2>

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
          {loading ? "Logging..." : "Login"}
        </button>

        <p className="text-sm mt-4">
          Don't have account?{" "}
          <Link href="/register" className="text-orange-500">
            Register
          </Link>
        </p>
      </form>

    </div>
  )
}