-- Create verification_codes table for email verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to deny all client access (edge function will use service role)
CREATE POLICY "Deny client access to verification codes"
ON public.verification_codes
FOR ALL
TO authenticated, anon
USING (false);

-- Create indexes for performance
CREATE INDEX idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);
CREATE INDEX idx_verification_codes_email_code ON public.verification_codes(email, code) WHERE NOT used;