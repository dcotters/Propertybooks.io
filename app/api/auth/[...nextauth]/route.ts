import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "../../../../lib/supabase"
import bcrypt from "bcryptjs"

const handler = NextAuth({
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback - Token:', JSON.stringify(token, null, 2))
      console.log('JWT Callback - User:', JSON.stringify(user, null, 2))
      console.log('JWT Callback - Account:', JSON.stringify(account, null, 2))
      
      if (user) {
        token.id = user.id
        console.log('JWT Callback - Setting user ID:', user.id)
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - Session:', JSON.stringify(session, null, 2))
      console.log('Session Callback - Token:', JSON.stringify(token, null, 2))
      
      if (token) {
        session.user.id = token.id as string
        console.log('Session Callback - Setting session user ID:', token.id)
      }
      return session
    },
    async signIn({ user, account, profile }) {
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
        domain: process.env.NODE_ENV === 'production' ? '.propertybooks.io' : undefined
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST } 