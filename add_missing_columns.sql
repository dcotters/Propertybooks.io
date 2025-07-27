-- Add missing columns to existing properties table
-- Run this in Supabase SQL editor to add any missing columns

-- Check if columns exist before adding them to avoid errors
DO $$
BEGIN
    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'country') THEN
        ALTER TABLE "properties" ADD COLUMN "country" TEXT;
    END IF;

    -- Add units column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'units') THEN
        ALTER TABLE "properties" ADD COLUMN "units" INTEGER;
    END IF;

    -- Add monthlyRent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'monthlyRent') THEN
        ALTER TABLE "properties" ADD COLUMN "monthlyRent" DECIMAL(10,2);
    END IF;

    -- Add mortgageRate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'mortgageRate') THEN
        ALTER TABLE "properties" ADD COLUMN "mortgageRate" DOUBLE PRECISION;
    END IF;

    -- Add mortgagePayment column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'mortgagePayment') THEN
        ALTER TABLE "properties" ADD COLUMN "mortgagePayment" DECIMAL(10,2);
    END IF;

    -- Add propertyTax column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'propertyTax') THEN
        ALTER TABLE "properties" ADD COLUMN "propertyTax" DECIMAL(10,2);
    END IF;

    -- Add insurance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'insurance') THEN
        ALTER TABLE "properties" ADD COLUMN "insurance" DECIMAL(10,2);
    END IF;

    -- Add hoaFees column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'hoaFees') THEN
        ALTER TABLE "properties" ADD COLUMN "hoaFees" DECIMAL(10,2);
    END IF;

    -- Add estimatedValue column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'estimatedValue') THEN
        ALTER TABLE "properties" ADD COLUMN "estimatedValue" DECIMAL(10,2);
    END IF;

    -- Add yearBuilt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'yearBuilt') THEN
        ALTER TABLE "properties" ADD COLUMN "yearBuilt" INTEGER;
    END IF;

    -- Add squareFootage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'squareFootage') THEN
        ALTER TABLE "properties" ADD COLUMN "squareFootage" INTEGER;
    END IF;

    -- Add bedrooms column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
        ALTER TABLE "properties" ADD COLUMN "bedrooms" INTEGER;
    END IF;

    -- Add bathrooms column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
        ALTER TABLE "properties" ADD COLUMN "bathrooms" INTEGER;
    END IF;

    -- Add parkingSpaces column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'parkingSpaces') THEN
        ALTER TABLE "properties" ADD COLUMN "parkingSpaces" INTEGER;
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description') THEN
        ALTER TABLE "properties" ADD COLUMN "description" TEXT;
    END IF;

END $$; 

-- Migration: Add missing columns to public."User" table for settings/profile
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS notificationPreferences jsonb;
-- You can add more columns as needed for businessName, businessAddress, taxId, accountingMethod, etc. 