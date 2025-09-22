"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
  CredentialsSignin: "Invalid email or password.",
  EmailSignin: "Unable to send email verification.",
  Callback: "Error in handling the callback from external provider.",
  OAuthSignin: "Error in constructing an authorization URL.",
  OAuthCallback: "Error in handling the response from external provider.",
  OAuthCreateAccount: "Could not create OAuth account.",
  SessionRequired: "You must be signed in to view this page.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Default";

  const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          {error === "Verification" && (
            <Alert>
              <AlertDescription>
                Please request a new verification link or try signing in again.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <Alert>
              <AlertDescription className="text-xs text-muted-foreground">
                <strong>Debug Info:</strong> Error code: {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}