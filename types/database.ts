export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          userId: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
        }
        Insert: {
          id?: string
          userId: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Update: {
          id?: string
          userId?: string
          type?: string
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          sessionToken: string
          userId: string
          expires: string
        }
        Insert: {
          id?: string
          sessionToken: string
          userId: string
          expires: string
        }
        Update: {
          id?: string
          sessionToken?: string
          userId?: string
          expires?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          emailVerified: string | null
          image: string | null
          password: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          emailVerified?: string | null
          image?: string | null
          password?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          emailVerified?: string | null
          image?: string | null
          password?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
        }
      }
      properties: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zipCode: string
          country: string | null
          propertyType: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'COMMERCIAL' | 'LAND'
          purchasePrice: string
          purchaseDate: string
          units: number | null
          monthlyRent: string | null
          mortgageRate: number | null
          mortgagePayment: string | null
          propertyTax: string | null
          insurance: string | null
          hoaFees: string | null
          estimatedValue: string | null
          yearBuilt: number | null
          squareFootage: number | null
          bedrooms: number | null
          bathrooms: number | null
          parkingSpaces: number | null
          description: string | null
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zipCode: string
          country?: string | null
          propertyType: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'COMMERCIAL' | 'LAND'
          purchasePrice: string
          purchaseDate: string
          units?: number | null
          monthlyRent?: string | null
          mortgageRate?: number | null
          mortgagePayment?: string | null
          propertyTax?: string | null
          insurance?: string | null
          hoaFees?: string | null
          estimatedValue?: string | null
          yearBuilt?: number | null
          squareFootage?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parkingSpaces?: number | null
          description?: string | null
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zipCode?: string
          country?: string | null
          propertyType?: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDO' | 'TOWNHOUSE' | 'COMMERCIAL' | 'LAND'
          purchasePrice?: string
          purchaseDate?: string
          units?: number | null
          monthlyRent?: string | null
          mortgageRate?: number | null
          mortgagePayment?: string | null
          propertyTax?: string | null
          insurance?: string | null
          hoaFees?: string | null
          estimatedValue?: string | null
          yearBuilt?: number | null
          squareFootage?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          parkingSpaces?: number | null
          description?: string | null
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'INCOME' | 'EXPENSE'
          amount: string
          description: string
          category: string
          date: string
          propertyId: string | null
          userId: string
          receiptUrl: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          type: 'INCOME' | 'EXPENSE'
          amount: string
          description: string
          category: string
          date: string
          propertyId?: string | null
          userId: string
          receiptUrl?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          type?: 'INCOME' | 'EXPENSE'
          amount?: string
          description?: string
          category?: string
          date?: string
          propertyId?: string | null
          userId?: string
          receiptUrl?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          userId: string
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIAL'
          plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
          currentPeriodStart: string | null
          currentPeriodEnd: string | null
          cancelAtPeriodEnd: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIAL'
          plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
          currentPeriodStart?: string | null
          currentPeriodEnd?: string | null
          cancelAtPeriodEnd?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          status?: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIAL'
          plan?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
          currentPeriodStart?: string | null
          currentPeriodEnd?: string | null
          cancelAtPeriodEnd?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          type: 'RECEIPT' | 'INVOICE' | 'CONTRACT' | 'INSURANCE' | 'TAX_DOCUMENT' | 'OTHER'
          url: string
          size: number
          propertyId: string | null
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          type: 'RECEIPT' | 'INVOICE' | 'CONTRACT' | 'INSURANCE' | 'TAX_DOCUMENT' | 'OTHER'
          url: string
          size: number
          propertyId?: string | null
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'RECEIPT' | 'INVOICE' | 'CONTRACT' | 'INSURANCE' | 'TAX_DOCUMENT' | 'OTHER'
          url?: string
          size?: number
          propertyId?: string | null
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 