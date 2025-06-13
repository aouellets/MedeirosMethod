# Authentication Setup Verification Guide

## Overview

Your Medeiros Method app has a comprehensive authentication setup with both automatic and manual profile creation. This guide will help you verify that users are correctly set up with Supabase auth and linked to the profiles table during signup.

## Current Authentication Architecture

### 1. Database Structure ✅

Your setup includes:

- **`auth.users`** table (managed by Supabase)
- **`profiles`** table (your custom user data)
- **`training_stats`** table (user fitness tracking)

### 2. Profile Creation Strategy (Dual Approach) ✅

You have implemented a **dual approach** for profile creation:

#### A. Database Trigger (Primary Method)
```sql
-- From: supabase/migrations/20240612_create_profiles_table.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.training_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### B. Manual Profile Creation (Fallback Method)
```javascript
// From: src/services/authService.js
async signUp(email, password, profileData = {}) {
  // Create auth user first
  const { data, error } = await supabase.auth.signUp({ email, password });
  
  // Then create profile manually (fallback)
  if (data.user && data.session) {
    try {
      await this.createUserProfile(data.user, profileData);
    } catch (profileError) {
      // Profile will be created later when they access the app
    }
  }
}
```

### 3. Foreign Key Relationships ✅

```sql
-- Profiles table links to auth.users with CASCADE deletion
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Training stats link to profiles with CASCADE deletion  
ALTER TABLE public.training_stats 
  ADD CONSTRAINT training_stats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

## Verification Methods

### Method 1: Command Line Testing (Quick)

1. **Update the verification script:**
   ```bash
   # Edit verify-auth-setup.js
   # Replace 'your_anon_key_here' with your actual Supabase anon key
   ```

2. **Run the verification:**
   ```bash
   node verify-auth-setup.js
   ```

3. **The script will test:**
   - Database connection
   - Table existence (profiles, training_stats)
   - Database trigger existence
   - Complete signup flow (optional)
   - Profile linkage verification

### Method 2: In-App Testing (Comprehensive)

1. **Add the verification screen to your app:**
   ```javascript
   // Add to your navigation stack (for development only)
   import AuthVerificationScreen from './src/screens/dev/AuthVerificationScreen';
   ```

2. **Use the verification utilities:**
   ```javascript
   import AuthVerificationService from './src/utils/authVerification';
   
   // Quick health check
   await AuthVerificationService.quickHealthCheck();
   
   // Full verification
   await AuthVerificationService.verifyUserSetup();
   ```

### Method 3: Manual Database Check

1. **Go to your Supabase dashboard**
2. **Check the SQL Editor:**
   ```sql
   -- Check if trigger exists
   SELECT trigger_name, event_manipulation, action_statement
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   
   -- Check profile linkage for existing users
   SELECT 
     au.id as auth_user_id,
     au.email as auth_email,
     p.id as profile_id,
     p.email as profile_email,
     p.first_name,
     ts.user_id as training_stats_user_id
   FROM auth.users au
   LEFT JOIN public.profiles p ON au.id = p.id
   LEFT JOIN public.training_stats ts ON p.id = ts.user_id
   LIMIT 5;
   ```

## Expected Signup Flow

### Successful Signup Should:

1. **Create auth.users entry** ✅
2. **Trigger fires automatically** ✅
   - Creates `profiles` record with `id = auth.users.id`
   - Creates `training_stats` record with `user_id = profiles.id`
3. **Manual fallback executes** (if trigger fails) ✅
4. **User gets session** ✅
5. **App loads user profile** ✅

### What to Check:

```javascript
// After successful signup, verify:
const user = await supabase.auth.getUser();
const profile = await supabase.from('profiles').select('*').eq('id', user.id);
const stats = await supabase.from('training_stats').select('*').eq('user_id', user.id);

console.log('User:', user.data.user.id);
console.log('Profile:', profile.data?.[0]?.id);
console.log('Stats:', stats.data?.[0]?.user_id);

// All three should have the same ID
```

## Common Issues and Solutions

### Issue 1: Profile Not Created
**Symptoms:** User can login but has no profile data

**Diagnosis:**
```javascript
// Check in console after signup
const { data: { user } } = await supabase.auth.getUser();
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (error?.code === 'PGRST116') {
  console.log('❌ Profile not found - trigger may have failed');
}
```

**Solutions:**
1. Check if database trigger exists and is enabled
2. Verify manual profile creation logic is working
3. Check RLS policies aren't blocking profile creation

### Issue 2: Training Stats Missing
**Symptoms:** Profile exists but no training stats

**Solutions:**
1. Update trigger to create training stats
2. Use ProfileService.getOrCreateTrainingStats() as fallback

### Issue 3: Email Confirmation Required
**Symptoms:** Profile created but no session

**Expected Behavior:**
```javascript
const result = await signUp(email, password, profileData);
if (result.needsEmailConfirmation) {
  // This is normal - profile may be created via trigger
  // or when user confirms email and signs in
}
```

## Testing Checklist

- [ ] Database connection working
- [ ] `profiles` table exists with proper structure
- [ ] `training_stats` table exists
- [ ] Database trigger `on_auth_user_created` exists
- [ ] Foreign key constraints properly set up
- [ ] RLS policies allow profile creation
- [ ] Manual profile creation works as fallback
- [ ] Signup flow creates both profile and training stats
- [ ] Profile data properly linked to auth.users
- [ ] Email confirmation flow works
- [ ] Cascade deletion works (for cleanup)

## Production Monitoring

### Key Metrics to Monitor:

1. **Auth Success Rate:**
   ```sql
   -- Check auth.users vs profiles ratio
   SELECT 
     (SELECT COUNT(*) FROM auth.users) as total_auth_users,
     (SELECT COUNT(*) FROM public.profiles) as total_profiles;
   ```

2. **Profile Creation Success:**
   ```sql
   -- Find users without profiles (should be 0 or very low)
   SELECT au.id, au.email, au.created_at
   FROM auth.users au
   LEFT JOIN public.profiles p ON au.id = p.id
   WHERE p.id IS NULL;
   ```

3. **Training Stats Coverage:**
   ```sql
   -- Check profiles without training stats
   SELECT p.id, p.email, p.created_at
   FROM public.profiles p
   LEFT JOIN public.training_stats ts ON p.id = ts.user_id
   WHERE ts.user_id IS NULL;
   ```

## Quick Test Commands

```bash
# Run full verification
node verify-auth-setup.js

# Test signup in your app
npm start
# Navigate to AuthVerificationScreen (dev)
# Click "Test Signup Flow"

# Check Supabase dashboard
# Authentication > Users (should show new users)
# Table Editor > profiles (should show matching profiles)
# Table Editor > training_stats (should show matching stats)
```

## Support

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Use the verification tools** provided above
3. **Monitor your Supabase dashboard** for auth events
4. **Check RLS policies** aren't blocking operations
5. **Verify your environment variables** are correct

Your current setup appears robust with both automatic (trigger) and manual (fallback) profile creation, which should ensure users are properly set up even if one method fails. 