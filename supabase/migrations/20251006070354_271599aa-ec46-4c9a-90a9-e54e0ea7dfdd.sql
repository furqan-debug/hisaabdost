-- Create family role enum
CREATE TYPE public.family_role AS ENUM ('owner', 'admin', 'member');

-- Create invitation status enum
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'rejected');

-- Create families table
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on families
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Create family_members table
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.family_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(family_id, user_id)
);

-- Enable RLS on family_members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create family_invitations table
CREATE TABLE public.family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on family_invitations
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Add family_id to expenses table
ALTER TABLE public.expenses ADD COLUMN family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- Add family columns to budgets table
ALTER TABLE public.budgets ADD COLUMN family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;
ALTER TABLE public.budgets ADD COLUMN is_shared BOOLEAN DEFAULT false;

-- Add family columns to profiles table
ALTER TABLE public.profiles ADD COLUMN active_family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN display_name TEXT;

-- Create indexes for performance
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_family_user ON public.family_members(family_id, user_id);
CREATE INDEX idx_expenses_family_id_date ON public.expenses(family_id, date);
CREATE INDEX idx_budgets_family_id ON public.budgets(family_id);
CREATE INDEX idx_family_invitations_token ON public.family_invitations(token);
CREATE INDEX idx_family_invitations_email ON public.family_invitations(email);

-- Create security definer function to check family membership
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE user_id = _user_id
      AND family_id = _family_id
      AND is_active = true
  )
$$;

-- Create security definer function to check family role
CREATE OR REPLACE FUNCTION public.has_family_role(_user_id UUID, _family_id UUID, _role public.family_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_members
    WHERE user_id = _user_id
      AND family_id = _family_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create security definer function to get user's family IDs
CREATE OR REPLACE FUNCTION public.get_user_family_ids(_user_id UUID)
RETURNS TABLE(family_id UUID)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id
  FROM public.family_members
  WHERE user_id = _user_id
    AND is_active = true
$$;

-- RLS Policies for families table
CREATE POLICY "Users can view families they are members of"
  ON public.families FOR SELECT
  USING (public.is_family_member(auth.uid(), id));

CREATE POLICY "Users can create their own families"
  ON public.families FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only owners can update families"
  ON public.families FOR UPDATE
  USING (public.has_family_role(auth.uid(), id, 'owner'));

CREATE POLICY "Only owners can delete families"
  ON public.families FOR DELETE
  USING (public.has_family_role(auth.uid(), id, 'owner'));

-- RLS Policies for family_members table
CREATE POLICY "Users can view members of their families"
  ON public.family_members FOR SELECT
  USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Owners and admins can add members"
  ON public.family_members FOR INSERT
  WITH CHECK (
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin')
  );

CREATE POLICY "Owners and admins can update members"
  ON public.family_members FOR UPDATE
  USING (
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin')
  );

CREATE POLICY "Owners and admins can remove members, members can remove themselves"
  ON public.family_members FOR DELETE
  USING (
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin') OR
    (auth.uid() = user_id)
  );

-- RLS Policies for family_invitations table
CREATE POLICY "Users can view invitations for their families"
  ON public.family_invitations FOR SELECT
  USING (public.is_family_member(auth.uid(), family_id) OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Family members can create invitations"
  ON public.family_invitations FOR INSERT
  WITH CHECK (
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin')
  );

CREATE POLICY "Family members can update invitations"
  ON public.family_invitations FOR UPDATE
  USING (
    public.has_family_role(auth.uid(), family_id, 'owner') OR
    public.has_family_role(auth.uid(), family_id, 'admin')
  );

-- Update expenses RLS policies to include family context
DROP POLICY IF EXISTS "Users can only see their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow users to select their own expenses" ON public.expenses;

CREATE POLICY "Users can view their own or family expenses"
  ON public.expenses FOR SELECT
  USING (
    auth.uid() = user_id OR
    family_id IN (SELECT public.get_user_family_ids(auth.uid()))
  );

CREATE POLICY "Users can insert their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (family_id IN (SELECT public.get_user_family_ids(auth.uid())) AND
     (public.has_family_role(auth.uid(), family_id, 'owner') OR
      public.has_family_role(auth.uid(), family_id, 'admin')))
  );

CREATE POLICY "Users can delete their own expenses or family admins can delete"
  ON public.expenses FOR DELETE
  USING (
    auth.uid() = user_id OR
    (family_id IN (SELECT public.get_user_family_ids(auth.uid())) AND
     (public.has_family_role(auth.uid(), family_id, 'owner') OR
      public.has_family_role(auth.uid(), family_id, 'admin')))
  );

-- Update budgets RLS policies to include family context
CREATE POLICY "Users can view their own or family budgets"
  ON public.budgets FOR SELECT
  USING (
    auth.uid() = user_id OR
    (family_id IN (SELECT public.get_user_family_ids(auth.uid())))
  );

CREATE POLICY "Users can insert their own or family budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    (family_id IN (SELECT public.get_user_family_ids(auth.uid())))
  );

CREATE POLICY "Users can update their own budgets or family budgets if admin"
  ON public.budgets FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (family_id IN (SELECT public.get_user_family_ids(auth.uid())) AND
     (public.has_family_role(auth.uid(), family_id, 'owner') OR
      public.has_family_role(auth.uid(), family_id, 'admin')))
  );

CREATE POLICY "Users can delete their own budgets or family budgets if admin"
  ON public.budgets FOR DELETE
  USING (
    auth.uid() = user_id OR
    (family_id IN (SELECT public.get_user_family_ids(auth.uid())) AND
     (public.has_family_role(auth.uid(), family_id, 'owner') OR
      public.has_family_role(auth.uid(), family_id, 'admin')))
  );

-- Create trigger to automatically add creator as owner when family is created
CREATE OR REPLACE FUNCTION public.handle_new_family()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_family_created
  AFTER INSERT ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_family();

-- Create function to update families updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_families_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_families_timestamp
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.update_families_updated_at();