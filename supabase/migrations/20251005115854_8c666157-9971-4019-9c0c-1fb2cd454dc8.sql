-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  loan_type TEXT NOT NULL CHECK (loan_type IN ('i_gave', 'i_took')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'partially_paid', 'fully_paid')),
  due_date DATE,
  note TEXT,
  remaining_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan_repayments table
CREATE TABLE public.loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan_installments table
CREATE TABLE public.loan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_installments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loans table
CREATE POLICY "Users can view their own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
  ON public.loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
  ON public.loans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for loan_repayments table
CREATE POLICY "Users can view their own loan repayments"
  ON public.loan_repayments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_repayments.loan_id
    AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own loan repayments"
  ON public.loan_repayments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_repayments.loan_id
    AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own loan repayments"
  ON public.loan_repayments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_repayments.loan_id
    AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own loan repayments"
  ON public.loan_repayments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_repayments.loan_id
    AND loans.user_id = auth.uid()
  ));

-- RLS Policies for loan_installments table
CREATE POLICY "Users can view their own loan installments"
  ON public.loan_installments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_installments.loan_id
    AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own loan installments"
  ON public.loan_installments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_installments.loan_id
    AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own loan installments"
  ON public.loan_installments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_installments.loan_id
    AND loans.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own loan installments"
  ON public.loan_installments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.loans
    WHERE loans.id = loan_installments.loan_id
    AND loans.user_id = auth.uid()
  ));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_loans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loans_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_due_date ON public.loans(due_date);
CREATE INDEX idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);
CREATE INDEX idx_loan_installments_loan_id ON public.loan_installments(loan_id);
CREATE INDEX idx_loan_installments_status ON public.loan_installments(status);