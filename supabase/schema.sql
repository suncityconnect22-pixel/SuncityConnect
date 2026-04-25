-- ============================================================
-- SuncityConnect — Complete Database Schema
-- Run this ENTIRE file in Supabase SQL Editor in one go
-- ============================================================

-- ===================== TABLES =====================

-- Users (public profile linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  house_number TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user', 'guard')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  house_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_number TEXT NOT NULL,
  visitor_type TEXT NOT NULL CHECK (visitor_type IN ('maid', 'delivery', 'service', 'guest')),
  name TEXT,
  photo_url TEXT,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  recorded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== FUTURE TABLES (structure only) =====================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  type TEXT CHECK (type IN ('buy', 'sell')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== INDEXES =====================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON public.users(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_house_number ON public.users(house_number);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_visitors_house_number ON public.visitors(house_number);
CREATE INDEX IF NOT EXISTS idx_visitors_entry_time ON public.visitors(entry_time);
CREATE INDEX IF NOT EXISTS idx_notices_is_important ON public.notices(is_important);

-- ===================== HELPER FUNCTIONS =====================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Check if current user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_approved, false) FROM public.users WHERE id = auth.uid();
$$;

-- Get current user's house number
CREATE OR REPLACE FUNCTION public.get_user_house()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT house_number FROM public.users WHERE id = auth.uid();
$$;

-- ===================== TRIGGER: Auto-create user profile =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================== ENABLE RLS ON ALL TABLES =====================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;

-- ===================== RLS POLICIES: users =====================

-- Users can read their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Super admin can read all users
CREATE POLICY "users_select_super_admin" ON public.users
  FOR SELECT USING (get_user_role() = 'super_admin');

-- Admin can read all users
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (get_user_role() = 'admin');

-- Users can update their own profile (name, phone only — NOT role, is_approved, payment_status)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
    AND is_approved = (SELECT is_approved FROM public.users WHERE id = auth.uid())
    AND payment_status = (SELECT payment_status FROM public.users WHERE id = auth.uid())
  );

-- Super admin can update any user
CREATE POLICY "users_update_super_admin" ON public.users
  FOR UPDATE USING (get_user_role() = 'super_admin');

-- Super admin can delete users
CREATE POLICY "users_delete_super_admin" ON public.users
  FOR DELETE USING (get_user_role() = 'super_admin');

-- ===================== RLS POLICIES: notices =====================

-- All approved users can read notices
CREATE POLICY "notices_select_approved" ON public.notices
  FOR SELECT USING (is_user_approved() = true);

-- Admin and super_admin can insert
CREATE POLICY "notices_insert_admin" ON public.notices
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

-- Admin and super_admin can update
CREATE POLICY "notices_update_admin" ON public.notices
  FOR UPDATE USING (get_user_role() IN ('admin', 'super_admin'));

-- Admin and super_admin can delete
CREATE POLICY "notices_delete_admin" ON public.notices
  FOR DELETE USING (get_user_role() IN ('admin', 'super_admin'));

-- ===================== RLS POLICIES: complaints =====================

-- Users can see their own complaints
CREATE POLICY "complaints_select_own" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

-- Admin/super_admin can see all complaints
CREATE POLICY "complaints_select_admin" ON public.complaints
  FOR SELECT USING (get_user_role() IN ('admin', 'super_admin'));

-- Approved users can create complaints
CREATE POLICY "complaints_insert_user" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_user_approved() = true);

-- Admin/super_admin can update status
CREATE POLICY "complaints_update_admin" ON public.complaints
  FOR UPDATE USING (get_user_role() IN ('admin', 'super_admin'));

-- ===================== RLS POLICIES: visitors =====================

-- Users can see visitors for their house
CREATE POLICY "visitors_select_own_house" ON public.visitors
  FOR SELECT USING (house_number = get_user_house());

-- Admin/super_admin/guard can see all visitors
CREATE POLICY "visitors_select_staff" ON public.visitors
  FOR SELECT USING (get_user_role() IN ('admin', 'super_admin', 'guard'));

-- Guard can insert visitors
CREATE POLICY "visitors_insert_guard" ON public.visitors
  FOR INSERT WITH CHECK (get_user_role() = 'guard');

-- Guard can update visitors (exit time)
CREATE POLICY "visitors_update_guard" ON public.visitors
  FOR UPDATE USING (get_user_role() = 'guard');

-- ===================== RLS POLICIES: staff =====================

-- All approved users can read staff
CREATE POLICY "staff_select_approved" ON public.staff
  FOR SELECT USING (is_user_approved() = true);

-- Admin/super_admin can insert
CREATE POLICY "staff_insert_admin" ON public.staff
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

-- Admin/super_admin can update
CREATE POLICY "staff_update_admin" ON public.staff
  FOR UPDATE USING (get_user_role() IN ('admin', 'super_admin'));

-- Admin/super_admin can delete
CREATE POLICY "staff_delete_admin" ON public.staff
  FOR DELETE USING (get_user_role() IN ('admin', 'super_admin'));

-- ===================== DONE =====================
-- After running this, sign up with your email, then run:
-- UPDATE public.users SET role = 'super_admin', is_approved = true, payment_status = 'paid' WHERE email = 'your@email.com';
