-- Remove demographics columns from users table
-- These are now handled in the separate user_demographics table

-- First migrate any existing data to user_demographics table
insert into public.user_demographics (user_id, age, weight, sex, address)
select 
  id as user_id,
  age,
  weight,
  sex,
  coalesce(address, '{}'::jsonb) as address
from public.users 
where (age is not null or weight is not null or sex is not null or address is not null)
on conflict (user_id) do update set
  age = coalesce(excluded.age, user_demographics.age),
  weight = coalesce(excluded.weight, user_demographics.weight),
  sex = coalesce(excluded.sex, user_demographics.sex),
  address = coalesce(excluded.address, user_demographics.address),
  updated_at = now();

-- Now remove the columns from users table
alter table public.users drop column if exists age;
alter table public.users drop column if exists weight;
alter table public.users drop column if exists sex;
alter table public.users drop column if exists address;