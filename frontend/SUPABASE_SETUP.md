# Supabase Setup Instructions for OncoSafeRx

This guide will help you set up Supabase authentication for the OncoSafeRx application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `oncosaferx` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

### 2. Get Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

### 3. Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` file
3. Paste it into the SQL Editor and run it
4. This will create:
   - `users` table with proper schema
   - Row Level Security (RLS) policies
   - Automatic user profile creation trigger

### 5. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - Enable email confirmations if desired
   - Configure email templates if needed

### 6. Test the Integration

1. Restart your development server: `npm run dev`
2. Try signing up a new user
3. Check the Supabase dashboard:
   - Go to Authentication > Users to see the auth user
   - Go to Table Editor > users to see the profile data

## Database Schema

The `users` table includes:

- **id**: UUID (linked to auth.users)
- **email**: User's email address
- **first_name**: User's first name
- **last_name**: User's last name
- **role**: User role (oncologist, pharmacist, nurse, researcher, student)
- **specialty**: Medical specialty
- **institution**: Healthcare institution
- **license_number**: Professional license number
- **years_experience**: Years of experience
- **preferences**: JSON object with user preferences
- **persona**: JSON object with user persona settings
- **created_at**: Account creation timestamp
- **last_login**: Last login timestamp
- **is_active**: Account status

## Security Features

- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic profile creation on signup
- Secure authentication with Supabase Auth

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure to restart your development server after updating `.env`
   - Ensure variable names start with `VITE_`

2. **Database connection errors**
   - Verify your Supabase URL and anon key are correct
   - Check that your project is active in Supabase dashboard

3. **RLS policy errors**
   - Ensure the database schema was created correctly
   - Check that RLS policies are enabled

4. **User creation fails**
   - Check the trigger function was created
   - Verify the users table exists with correct schema

### Support

If you encounter issues:

1. Check the browser console for error messages
2. Check the Supabase logs in your dashboard
3. Verify your environment variables are correctly set
4. Ensure the database schema matches the expected structure

## Production Deployment

For production:

1. Update environment variables with production Supabase credentials
2. Configure proper redirect URLs in Supabase Auth settings
3. Set up email provider for authentication emails
4. Consider enabling additional security features like MFA