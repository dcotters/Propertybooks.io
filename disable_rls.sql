-- Disable Row Level Security on tables that don't need it
-- Run this in your Supabase SQL editor

-- Disable RLS on User table (NextAuth handles authentication)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Account table (NextAuth handles this)
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Session table (NextAuth handles this)
ALTER TABLE "Session" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on VerificationToken table (NextAuth handles this)
ALTER TABLE "VerificationToken" DISABLE ROW LEVEL SECURITY;

-- Disable RLS on subscriptions table (handled by your app logic)
ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on business tables but create proper policies
-- Properties - users can only see their own properties
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;

-- Transactions - users can only see their own transactions  
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;

-- Documents - users can only see their own documents
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;

-- Create policies for business tables (only if they don't exist)
DO $$
BEGIN
    -- Properties policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can view own properties') THEN
        CREATE POLICY "Users can view own properties" ON "properties"
            FOR SELECT USING (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can insert own properties') THEN
        CREATE POLICY "Users can insert own properties" ON "properties"
            FOR INSERT WITH CHECK (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can update own properties') THEN
        CREATE POLICY "Users can update own properties" ON "properties"
            FOR UPDATE USING (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can delete own properties') THEN
        CREATE POLICY "Users can delete own properties" ON "properties"
            FOR DELETE USING (auth.uid()::text = "userId");
    END IF;

    -- Transactions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions') THEN
        CREATE POLICY "Users can view own transactions" ON "transactions"
            FOR SELECT USING (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert own transactions') THEN
        CREATE POLICY "Users can insert own transactions" ON "transactions"
            FOR INSERT WITH CHECK (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update own transactions') THEN
        CREATE POLICY "Users can update own transactions" ON "transactions"
            FOR UPDATE USING (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can delete own transactions') THEN
        CREATE POLICY "Users can delete own transactions" ON "transactions"
            FOR DELETE USING (auth.uid()::text = "userId");
    END IF;

    -- Documents policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can view own documents') THEN
        CREATE POLICY "Users can view own documents" ON "documents"
            FOR SELECT USING (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can insert own documents') THEN
        CREATE POLICY "Users can insert own documents" ON "documents"
            FOR INSERT WITH CHECK (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can update own documents') THEN
        CREATE POLICY "Users can update own documents" ON "documents"
            FOR UPDATE USING (auth.uid()::text = "userId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Users can delete own documents') THEN
        CREATE POLICY "Users can delete own documents" ON "documents"
            FOR DELETE USING (auth.uid()::text = "userId");
    END IF;

END $$; 