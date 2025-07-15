-- Fix RLS for NextAuth compatibility
-- Run this in your Supabase SQL editor

-- Disable RLS on all tables since we're using NextAuth for authentication
-- and handling authorization in the API routes

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

-- Disable RLS on business tables - authorization handled in API routes
ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own properties" ON "properties";
DROP POLICY IF EXISTS "Users can insert own properties" ON "properties";
DROP POLICY IF EXISTS "Users can update own properties" ON "properties";
DROP POLICY IF EXISTS "Users can delete own properties" ON "properties";

DROP POLICY IF EXISTS "Users can view own transactions" ON "transactions";
DROP POLICY IF EXISTS "Users can insert own transactions" ON "transactions";
DROP POLICY IF EXISTS "Users can update own transactions" ON "transactions";
DROP POLICY IF EXISTS "Users can delete own transactions" ON "transactions";

DROP POLICY IF EXISTS "Users can view own documents" ON "documents";
DROP POLICY IF EXISTS "Users can insert own documents" ON "documents";
DROP POLICY IF EXISTS "Users can update own documents" ON "documents";
DROP POLICY IF EXISTS "Users can delete own documents" ON "documents";

-- Note: Authorization is now handled in your NextAuth API routes
-- where you check session.user.id before allowing operations 