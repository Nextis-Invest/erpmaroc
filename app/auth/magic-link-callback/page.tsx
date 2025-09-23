"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function MagicLinkCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleSignIn = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        router.push("/login?error=invalid-token");
        return;
      }

      try {
        // Use client-side signIn with the magic-link provider
        const result = await signIn("magic-link", {
          email,
          token,
          redirect: false,
        });

        if (result?.error) {
          console.error("Sign-in error:", result.error);
          router.push("/login?error=sign-in-failed");
        } else if (result?.ok) {
          // Successful sign-in, redirect to dashboard
          router.push("/");
        }
      } catch (error) {
        console.error("Sign-in process error:", error);
        router.push("/login?error=auth-failed");
      }
    };

    handleSignIn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}