import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/database/mongodb"
import bcrypt from "bcryptjs"
import { connectToDB } from "@/lib/database/connectToDB"
import type { NextAuthConfig } from "next-auth"

// Import your admin model
import ADMIN, { type IAdmin } from "@/model/admin"
import MagicLinkToken, { type IMagicLinkToken } from "@/model/magicLinkToken"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDB()

        try {
          // Check in admin collection
          const admin = await ADMIN.findOne({ email: credentials.email })

          if (!admin) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            admin.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name || admin.email,
            role: admin.role || "admin",
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
    Credentials({
      id: "magic-link",
      name: "magic-link",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) {
          console.log("Magic link auth: Missing credentials")
          return null
        }

        await connectToDB()

        try {
          // Verify magic link token - check both used and unused tokens
          // The token might already be marked as used in some edge cases
          const magicLinkToken = await MagicLinkToken.findOne({
            token: credentials.token,
            email: credentials.email
          })

          if (!magicLinkToken) {
            console.log("Magic link auth: Token not found")
            return null
          }

          // Check if token is expired (15 minutes - matches TTL)
          const tokenAge = Date.now() - magicLinkToken.createdAt.getTime()
          const maxAge = 15 * 60 * 1000 // 15 minutes in milliseconds

          if (tokenAge > maxAge) {
            console.log("Magic link auth: Token expired")
            return null
          }

          // Get user
          const admin = await ADMIN.findOne({ email: credentials.email })

          if (!admin) {
            console.log("Magic link auth: User not found")
            return null
          }

          // Mark token as used only if it hasn't been used yet
          if (!magicLinkToken.used) {
            magicLinkToken.used = true
            await magicLinkToken.save()
          }

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name || admin.email,
            role: admin.role || "admin",
          }
        } catch (error) {
          console.error("Magic link auth error:", error)
          return null
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn() {
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle logout - allow redirects to login page
      if (url === `${baseUrl}/login` || url.endsWith('/login')) {
        return `${baseUrl}/login`
      }

      // Allow callback URLs and auth-related URLs
      if (url.startsWith(baseUrl)) {
        // Don't redirect auth-related URLs including magic link callback
        if (url.includes('/auth/') || url.includes('/api/auth/')) {
          return url
        }
        // Allow login page specifically
        if (url.includes('/login')) {
          return url
        }
        // For any other URL starting with baseUrl, redirect to dashboard after successful auth
        return `${baseUrl}/`
      }

      // For relative URLs, check specific paths
      if (url.startsWith('/login')) {
        return `${baseUrl}/login`
      }

      if (url.startsWith('/auth/magic-link-callback')) {
        return `${baseUrl}/auth/magic-link-callback`
      }

      // For relative URLs, redirect to dashboard
      if (url.startsWith('/')) {
        return `${baseUrl}/`
      }

      // Default to dashboard
      return `${baseUrl}/`
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)