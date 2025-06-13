# Supabase Cascade Deletion Setup

This document explains how user data cleanup is handled when a user account is deleted, ensuring GDPR compliance and proper data management.

## Overview

When a user deletes their account, all their associated data must be properly cleaned up. This includes:

- Profile data
- Training statistics
- Workouts and exercise logs
- Social posts, likes, comments, and follows
- Notifications
- Storage files (avatars, workout media)
- Any other user-related data

## Database Schema Setup

### Foreign Key Constraints

All tables that reference user data have `ON DELETE CASCADE` constraints:

```sql
-- Profiles table
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Training stats
ALTER TABLE public.training_stats 
  ADD CONSTRAINT training_stats_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Other tables follow the same pattern...
```

### Row Level Security (RLS) Policies

Each table has deletion policies ensuring users can only delete their own data:

```sql
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Users can delete own training stats" ON public.training_stats
  FOR DELETE USING (auth.uid() = user_id);
```

## Deletion Process

### 1. Database Function

The `delete_user_data(UUID)` function handles manual data cleanup:

```sql
SELECT public.delete_user_data('user-uuid-here');
```

This function:
- Verifies authorization (users can only delete their own data)
- Deletes data in proper dependency order
- Returns success/failure status

### 2. Trigger Function

The `handle_user_deletion()` trigger function:
- Logs deletions for audit purposes
- Can be extended to handle additional cleanup tasks
- Runs automatically when a user is deleted from `auth.users`

### 3. Edge Function

The `delete-user-account` Edge Function provides complete account deletion:

```javascript
// Client-side usage
const { data, error } = await supabase.functions.invoke('delete-user-account', {
  body: { confirm: true }
});
```

This function:
1. Verifies user authentication
2. Calls the database cleanup function
3. Deletes storage files (avatars, media)
4. Deletes the auth user record
5. Triggers cascade deletion of remaining data

## Usage

### From the App

```javascript
import { authService } from '../services/authService';

// Delete current user's account
const result = await authService.deleteAccount();
if (result.success) {
  // Account deleted successfully
} else {
  // Handle error
  console.error(result.error);
}
```

### Manual Cleanup (Admin)

```sql
-- Clean up specific user's data (admin only)
SELECT public.delete_user_data('user-uuid-here');

-- View audit log
SELECT * FROM public.audit_log WHERE table_name = 'auth.users' AND operation = 'DELETE';
```

## GDPR Compliance

This setup ensures GDPR compliance by:

1. **Complete Data Removal**: All user data is deleted when requested
2. **Audit Trail**: Deletions are logged for compliance reporting
3. **User Control**: Users can delete their own accounts
4. **Automated Cleanup**: Cascade deletion prevents orphaned data

## Storage Cleanup

The Edge Function handles storage file deletion:

- **Avatars**: `avatars/{user_id}/`
- **Workout Media**: `workout-media/{user_id}/`
- **Social Media**: `social-media/{user_id}/`

## Migration Files

1. **20240612_create_profiles_table.sql**: Base tables with cascade constraints
2. **20240615_add_cascade_deletion.sql**: Comprehensive cascade deletion setup

## Testing

To test the deletion process:

1. Create a test user account
2. Add some data (profile, workouts, etc.)
3. Call the deletion function
4. Verify all data is removed
5. Check audit logs

```sql
-- Verify user data is completely removed
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE id = 'deleted-user-id') as profiles,
  (SELECT COUNT(*) FROM public.training_stats WHERE user_id = 'deleted-user-id') as stats,
  (SELECT COUNT(*) FROM public.workouts WHERE user_id = 'deleted-user-id') as workouts;
-- Should return all zeros
```

## Security Considerations

- Only authenticated users can delete their own data
- Service role is required for admin operations
- Audit logs are only accessible to service role
- Edge Function requires proper authentication headers
- Database functions include authorization checks

## Troubleshooting

### Common Issues

1. **Foreign Key Violations**: Ensure proper deletion order in the cleanup function
2. **RLS Policy Errors**: Verify policies allow deletion for the authenticated user
3. **Storage Errors**: Check bucket permissions and file paths
4. **Edge Function Timeout**: Large datasets may require batch processing

### Debug Queries

```sql
-- Check foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'profiles';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'training_stats', 'workouts');
``` 