# Supabase Authentication Setup Guide

## Prerequisites

You already have a Supabase project with ID: `lvacourlbrjwlvioqrqc`

## Step 1: Get Your Supabase Keys

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: `lvacourlbrjwlvioqrqc`
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL**: `https://lvacourlbrjwlvioqrqc.supabase.co`
   - **Anon Public Key**: This is your `anon` key (starts with `eyJ...`)

## Step 2: Update Configuration

Replace the placeholder in `src/config/supabase.js`:

```javascript
export const SUPABASE_CONFIG = {
  url: 'https://lvacourlbrjwlvioqrqc.supabase.co',
  // Replace this with your actual anon key from Supabase dashboard
  anonKey: 'YOUR_ACTUAL_ANON_KEY_HERE',
};
```

## Step 3: Configure Authentication Settings

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
- Add your app URLs:
  - `medeirosmethod://` (for deep linking)
  - `exp://localhost:8081` (for Expo development)
  - `http://localhost:8081` (for Expo web)

### Email Templates
- Customize the email templates for:
  - Email confirmation
  - Password reset
  - Email change

### OAuth Providers (Optional)
To enable Google/Apple login:

1. Go to **Authentication** → **Providers**
2. Enable **Google**:
   - Add your Google OAuth client ID and secret
   - Add redirect URL: `https://lvacourlbrjwlvioqrqc.supabase.co/auth/v1/callback`
3. Enable **Apple**:
   - Add your Apple OAuth configuration
   - Add redirect URL: `https://lvacourlbrjwlvioqrqc.supabase.co/auth/v1/callback`

## Step 4: Database Setup

The authentication will work with Supabase's built-in auth system, but you may want to create additional tables for user profiles:

```sql
-- Create a profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policy for users to see their own profile
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = id);

-- Create policy for users to update their own profile
create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = id);

-- Create a trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, email)
  values (new.id, new.raw_user_meta_data->>'first_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Step 5: Install Dependencies

Make sure to install the new dependencies:

```bash
npm install
# or
yarn install
```

## Step 6: Test Authentication

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. Test the following features:
   - Sign up with email/password
   - Email confirmation (check your email)
   - Sign in with email/password
   - Password reset
   - Sign out

## Environment Variables (Optional)

For production, consider using environment variables:

Create a `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=https://lvacourlbrjwlvioqrqc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Then update `src/config/supabase.js`:
```javascript
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};
```

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Make sure you're using the correct anon key from your Supabase dashboard
2. **"Invalid login credentials"**: Ensure the user has confirmed their email address
3. **OAuth not working**: Check that redirect URLs are configured correctly
4. **Email not sending**: Check your email settings in Supabase dashboard

### Debug Mode:

Add this to see detailed auth logs:
```javascript
// In src/lib/supabase.js
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: __DEV__, // Enable debug in development
  },
});
```

## Security Notes

- Never commit your actual Supabase keys to version control
- Use environment variables for production
- The anon key is safe to use in client-side code (it's designed for this)
- Row Level Security (RLS) policies protect your data even with the anon key

## Database Setup

### 1. Create Tables

Run the SQL scripts in the following order:

1. `supabase/migrations/001_create_profiles.sql`
2. `supabase/migrations/002_create_training_stats.sql`
3. `supabase/migrations/003_create_workouts.sql`
4. `supabase/migrations/004_create_workout_sessions.sql`
5. `supabase/migrations/005_create_exercises.sql`
6. `supabase/migrations/006_create_social_features.sql`

### 2. Set up Row Level Security (RLS)

Enable RLS on all tables and configure appropriate policies using the policy files in `supabase/policies/`.

## Storage Setup

### Manual Bucket Creation (Recommended)

To avoid RLS policy errors during app initialization, create these storage buckets manually in your Supabase dashboard:

1. **Go to Storage** in your Supabase dashboard
2. **Create the following buckets:**

#### Required Storage Buckets:

| Bucket Name | Public Access | Description |
|------------|---------------|-------------|
| `avatars` | ✅ Public | User profile pictures |
| `workout-media` | ❌ Private | Workout photos/videos |
| `progress-photos` | ❌ Private | User progress tracking photos |
| `social-posts` | ✅ Public | Social media post images/videos |
| `exercise-demos` | ✅ Public | Exercise demonstration videos |
| `thumbnails` | ✅ Public | Generated thumbnails |

#### For each bucket:

1. Click **"New bucket"**
2. Enter the bucket name exactly as shown above
3. Set **Public bucket** according to the table
4. Configure **File size limit**:
   - Image buckets: 10 MB
   - Video buckets: 100 MB
5. Set **Allowed MIME types**:
   - Image buckets: `image/jpeg`, `image/png`, `image/webp`
   - Video buckets: `video/mp4`, `video/mov`, `video/avi`

### 3. Storage Policies

After creating buckets, set up storage policies:

```sql
-- Example policy for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Example policy for viewing public avatars
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Environment Variables

Set these in your production environment:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Setup

1. **Enable email authentication** in Supabase Auth settings
2. **Configure OAuth providers** (Google, Apple) if needed
3. **Set up email templates** for password reset, etc.
4. **Configure redirect URLs** for OAuth:
   - Development: `medeirosmethod://auth/callback`
   - Production: `your-app://auth/callback`

## Post-Setup Verification

After completing the setup:

1. ✅ All tables should be created with proper RLS policies
2. ✅ All storage buckets should exist and be accessible
3. ✅ Authentication should work for email/password signup
4. ✅ Storage uploads should work for authenticated users
5. ✅ App should start without bucket creation errors

## Troubleshooting

### Storage Bucket Errors
- **Row-level security policy errors**: Create buckets manually in dashboard
- **Permission denied**: Check storage policies and user authentication
- **Bucket not found**: Verify bucket names match exactly

### Authentication Errors
- **Invalid JWT**: Check environment variables and Supabase configuration
- **Email not confirmed**: Check email templates and SMTP settings

For additional help, refer to the [Supabase documentation](https://supabase.com/docs). 