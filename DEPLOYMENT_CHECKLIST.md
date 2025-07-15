# Deployment Checklist for PropertyBooks.io

## Critical Environment Variables for Production

Make sure these are set in your Vercel environment variables:

### 1. NextAuth Configuration (CRITICAL)
```bash
NEXTAUTH_URL=https://www.propertybooks.io
NEXTAUTH_SECRET=your-32-character-secret-key-here
```

### 2. OAuth Providers
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://aydjhjuaeketvkldmite.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Other Required Variables
```bash
NODE_ENV=production
```

## How to Check Your Current Environment Variables

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Verify all the above variables are set

2. **Check NEXTAUTH_URL:**
   - This MUST be set to `https://www.propertybooks.io` (not localhost)
   - This is the most common cause of session issues in production

3. **Check NEXTAUTH_SECRET:**
   - Must be a 32-character string
   - Can be generated with: `openssl rand -base64 32`

## Testing Steps After Deployment

1. **Deploy the updated code** with logging
2. **Sign in to your app**
3. **Try to add a property**
4. **Check Vercel logs** for the debug output
5. **Look for these log messages:**
   - "JWT Callback - Setting user ID: [user-id]"
   - "Session Callback - Setting session user ID: [user-id]"
   - "POST /api/properties - Session: [session-data]"

## Common Issues and Solutions

### Issue: Session is null in API routes
**Solution:** Check `NEXTAUTH_URL` is set correctly

### Issue: User ID is missing from session
**Solution:** Check `NEXTAUTH_SECRET` is set and consistent

### Issue: Cookies not being sent
**Solution:** Verify domain settings in NextAuth config

## Debug Commands

To generate a new NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

To check if your domain is properly configured:
```bash
curl -I https://www.propertybooks.io/api/auth/session
``` 