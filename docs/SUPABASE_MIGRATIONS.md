Supabase Migrations (Patient Profile)

Run the SQL in `database/migrations/2025-11-01-001-patient-profile.sql` in your Supabase project (SQL editor or migrations pipeline):

Summary
- Adds `patient_profile JSONB` (default `{}`) to `public.users`.
- Ensures `preferences JSONB` exists.
- Creates a GIN index on `patient_profile` for JSON queries.

Snippet
```
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS patient_profile JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS users_patient_profile_gin
  ON public.users USING GIN (patient_profile jsonb_path_ops);
```

Notes
- If you use RLS on `public.users`, ensure policies allow the owner to read/update `patient_profile`.
- Keep Supabase Auth metadata small; `patient_profile` lives in `public.users` as the source of truth.

