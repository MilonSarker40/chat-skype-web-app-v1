"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter()
  const pathname = usePathname()

  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  const publicRoutes = ["/login", "/register"]

  useEffect(() => {
    if (!hasHydrated) return

    const isPublicRoute = publicRoutes.includes(pathname)

    if (!token && !isPublicRoute) {
      router.replace("/login")
    }
  }, [token, pathname, router, hasHydrated])

  if (!hasHydrated) return null

  return <>{children}</>
}