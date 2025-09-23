"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function MagicLinkCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'authenticating' | 'error' | 'success'>('authenticating');

  useEffect(() => {
    const handleSignIn = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      console.log("Magic link callback - token:", token ? "present" : "missing", "email:", email);

      if (!token || !email) {
        console.error("Missing token or email");
        setStatus('error');
        setTimeout(() => router.push("/login?error=invalid-token"), 2000);
        return;
      }

      try {
        console.log("Attempting sign-in with magic-link provider");
        // Use client-side signIn with the magic-link provider
        const result = await signIn("magic-link", {
          email,
          token,
          redirect: false,
        });

        console.log("Sign-in result:", result);

        if (result?.error) {
          console.error("Sign-in error:", result.error);
          setStatus('error');
          setTimeout(() => router.push("/login?error=magic-link-failed"), 2000);
        } else if (result?.ok) {
          console.log("Sign-in successful, redirecting to dashboard");
          setStatus('success');
          // Give user feedback before redirect
          setTimeout(() => router.push("/"), 1500);
        } else {
          console.error("Unexpected sign-in result:", result);
          setStatus('error');
          setTimeout(() => router.push("/login?error=auth-failed"), 2000);
        }
      } catch (error) {
        console.error("Sign-in process error:", error);
        setStatus('error');
        setTimeout(() => router.push("/login?error=auth-failed"), 2000);
      }
    };

    handleSignIn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
        {status === 'authenticating' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Authentification...</h2>
            <p className="text-gray-600 dark:text-gray-400">Veuillez patienter pendant que nous vous connectons.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-400">Connexion réussie !</h2>
            <p className="text-gray-600 dark:text-gray-400">Redirection vers le tableau de bord...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">Erreur d'authentification</h2>
            <p className="text-gray-600 dark:text-gray-400">Redirection vers la page de connexion...</p>
          </>
        )}
      </div>
    </div>
  );
}