-- Fix User table id column to have proper default value
-- Run this in your Supabase SQL editor

-- First, let's check the current structure
-- Then add a default value for the id column

-- Add default value for User id column using gen_random_uuid()
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Also fix the updatedAt column to have a proper default
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Do the same for other tables that might need it
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "properties" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "transactions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "documents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Set updatedAt defaults for all tables
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "properties" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "transactions" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "subscriptions" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "documents" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP; 