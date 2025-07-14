import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Create a wrapper that maps table names correctly
export const supabase = {
  from: (table: string) => {
    // Map lowercase table names to the correct case-sensitive names
    const tableMap: Record<string, string> = {
      'users': 'User',
      'accounts': 'Account', 
      'sessions': 'Session',
      'verification_tokens': 'VerificationToken',
      'properties': 'properties',
      'transactions': 'transactions',
      'subscriptions': 'subscriptions',
      'documents': 'documents'
    }
    
    const correctTableName = tableMap[table] || table
    return supabaseClient.from(correctTableName)
  }
}

// Also export the original client for direct access if needed
export { supabaseClient } 