# Migration from Prisma to Supabase

## Overview
This guide helps you migrate from Prisma ORM to Supabase for your Landlord Accounting Software.

## What's Been Done

### ✅ Completed
1. **Installed Supabase Client**: Added `@supabase/supabase-js` dependency
2. **Created Supabase Configuration**: `lib/supabase.ts` with client setup
3. **Updated Environment Variables**: Added Supabase-specific env vars to `env.example`
4. **Created Database Types**: `types/database.ts` with TypeScript types matching your schema
5. **Updated Package Scripts**: Removed Prisma-specific build scripts

### 🔄 Next Steps Required

#### 1. Update Environment Variables
Add these to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://aydjhjuaeketvkldmite.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

#### 2. Get Supabase Credentials
1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the `anon` public key and `service_role` secret key
4. Update your environment variables

#### 3. Update API Routes
You'll need to update all API routes to use Supabase instead of Prisma. Here are the files that need updating:

**High Priority:**
- `app/api/auth/[...nextauth]/route.ts` - Authentication
- `app/api/auth/register/route.ts` - User registration
- `app/api/properties/route.ts` - Property management
- `app/api/transactions/route.ts` - Transaction management

**Medium Priority:**
- `app/api/reports/route.ts` - Reports
- `app/api/notifications/route.ts` - Notifications
- `app/api/settings/route.ts` - User settings
- `app/api/upload/route.ts` - File uploads
- `app/api/webhooks/stripe/route.ts` - Stripe webhooks
- `app/api/create-checkout-session/route.ts` - Checkout sessions

**Low Priority:**
- `lib/subscription.ts` - Subscription utilities

#### 4. Update Authentication
Replace NextAuth Prisma adapter with Supabase Auth or keep NextAuth but update the adapter.

#### 5. Database Schema
Your existing Prisma schema can be converted to Supabase SQL. The SQL files in your root directory (`database_setup.sql`, `migration.sql`, etc.) should be run in your Supabase SQL editor.

## Example Migration Pattern

### Before (Prisma):
```typescript
import { prisma } from '../../../lib/prisma'

const user = await prisma.user.findUnique({
  where: { email: userEmail }
})
```

### After (Supabase):
```typescript
import { supabase } from '../../../lib/supabase'

const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)
  .single()
```

## Benefits of Migration
1. **Real-time subscriptions** - Built-in real-time capabilities
2. **Row Level Security** - Better security model
3. **Built-in Auth** - Optional Supabase Auth integration
4. **Edge Functions** - Serverless functions
5. **Storage** - Built-in file storage
6. **Reduced Dependencies** - No need for Prisma

## Rollback Plan
If needed, you can rollback by:
1. Keeping Prisma dependencies
2. Reverting package.json scripts
3. Using both clients temporarily during transition

## Questions?
- Check Supabase documentation: https://supabase.com/docs
- Review your existing SQL files for schema setup
- Test each API route after migration 