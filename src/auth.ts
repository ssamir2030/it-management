import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Credentials validation schema
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Authorize called for:", credentials?.email);

        const validated = credentialsSchema.safeParse(credentials)

        if (!validated.success) {
          console.error("❌ Validation failed")
          return null
        }

        const { email, password } = validated.data

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          console.error("❌ User not found or no password")
          return null
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          console.error("❌ Invalid password")
          return null
        }

        console.log("✅ Login successful:", user.email)

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 60 Minutes (1 Hour)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})

export const { GET, POST } = handlers
