# Vercel Environment Variables Setup

## CRITICAL: Fix Your Session Issues

Your app is failing because of missing/incorrect environment variables in Vercel. Follow these steps exactly:

## Step 1: Go to Vercel Dashboard

1. Open [vercel.com](https://vercel.com)
2. Sign in and go to your PropertyBooks.io project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

## Step 2: Add/Update These Environment Variables

### 1. NEXTAUTH_URL (CRITICAL)
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://www.propertybooks.io`
- **Environment:** Production, Preview, Development
- **This is the most important one!**

### 2. NEXTAUTH_SECRET (CRITICAL)
- **Name:** `NEXTAUTH_SECRET`
- **Value:** `qdfib/KeVHrg6Izklz3kT67keWlD1XCTaFidDR+r8Bo=`
- **Environment:** Production, Preview, Development

### 3. NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production, Preview, Development

### 4. Verify These Are Set
Make sure these are also set (they should already be there):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Redeploy

After setting the environment variables:

1. Go to the **Deployments** tab in Vercel
2. Find your latest deployment
3. Click the **⋮** menu and select **Redeploy**
4. Wait for the deployment to complete

## Step 4: Test

1. Go to your app: https://www.propertybooks.io
2. Sign in
3. Try to add a property
4. Check if the error is gone

## Step 5: Check Logs

If it still doesn't work, check the Vercel logs again. You should now see:
- Session data being logged
- User ID being passed correctly
- No more "No session or user ID found" errors

## Common Issues

### Issue: Still getting 401 errors
**Solution:** Make sure you redeployed after setting the environment variables

### Issue: Session endpoint returns 400
**Solution:** Check that NEXTAUTH_SECRET is exactly 32 characters

### Issue: Cookies not working
**Solution:** Verify NEXTAUTH_URL is set to the exact domain

## Debug Commands

To test if your session endpoint is working:
```bash
curl -I https://www.propertybooks.io/api/auth/session
```

Should return 200, not 400.

---

**The key issue is that NEXTAUTH_URL was probably set to localhost instead of your production domain.** 