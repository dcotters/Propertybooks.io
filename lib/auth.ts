import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "./supabase"
import bcrypt from "bcryptjs"

console.log('NextAuth Config - NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('NextAuth Config - NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
console.log('NextAuth Config - NODE_ENV:', process.env.NODE_ENV)

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('NextAuth - Authorize called with credentials:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('NextAuth - Missing credentials')
          return null
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        console.log('NextAuth - Supabase query result - User:', JSON.stringify(user, null, 2))
        console.log('NextAuth - Supabase query result - Error:', error)

        if (error || !user || !user.password) {
          console.log('NextAuth - User not found or error:', error)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('NextAuth - Invalid password')
          return null
        }

        console.log('NextAuth - User authorized:', user.id)
        console.log('NextAuth - Returning user object:', JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }, null, 2))
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      console.log('JWT Callback - Token:', JSON.stringify(token, null, 2))
      console.log('JWT Callback - User:', JSON.stringify(user, null, 2))
      console.log('JWT Callback - Account:', JSON.stringify(account, null, 2))
      
      if (user) {
        token.id = user.id
        console.log('JWT Callback - Setting user ID:', user.id)
      }
      
      // Always ensure the ID is present in the token
      if (!token.id && user?.id) {
        token.id = user.id
        console.log('JWT Callback - Setting user ID from user object:', user.id)
      }
      
      console.log('JWT Callback - Final token:', JSON.stringify(token, null, 2))
      return token
    },
    async session({ session, token }: any) {
      console.log('Session Callback - Session:', JSON.stringify(session, null, 2))
      console.log('Session Callback - Token:', JSON.stringify(token, null, 2))
      
      if (token?.id) {
        session.user.id = token.id as string
        console.log('Session Callback - Setting session user ID:', token.id)
      } else {
        console.log('Session Callback - No token ID found!')
      }
      
      console.log('Session Callback - Final session:', JSON.stringify(session, null, 2))
      return session
    },
    async signIn({ user, account, profile }: any) {
      console.log('SignIn Callback - User:', JSON.stringify(user, null, 2))
      console.log('SignIn Callback - Account:', JSON.stringify(account, null, 2))
      return true
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
} 