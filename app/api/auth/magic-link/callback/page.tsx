"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function MagicLinkCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (email && token) {
      signIn("magic-link", {
        email,
        token,
        redirect: false,
      }).then((result) => {
        if (result?.ok) {
          router.push("/admin")
        } else {
          router.push("/login?error=magic-link-failed")
        }
      })
    } else {
      router.push("/login?error=invalid-magic-link")
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-primary border-t-transparent">
        </div>
        <h2 className="text-2xl font-semibold">Verifying your magic link...</h2>
        <p className="mt-2 text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  )
}