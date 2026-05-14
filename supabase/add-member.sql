-- ADD A NEW MEMBER
-- Replace the email address, then run in Supabase SQL Editor.

INSERT INTO public.users (id, email, membership_status)
SELECT id, email, 'active'
FROM auth.users
WHERE LOWER(email) = LOWER('email@here.com');

-- To deactivate:
-- UPDATE public.users SET membership_status = 'inactive' WHERE LOWER(email) = LOWER('email@here.com');
