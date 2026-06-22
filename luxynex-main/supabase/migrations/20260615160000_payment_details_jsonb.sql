-- Payment details storage for checkout (run in Supabase SQL Editor if not migrated)
ALTER TABLE public.admin_orders
  ADD COLUMN IF NOT EXISTS payment_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sender_number text,
  ADD COLUMN IF NOT EXISTS transaction_id text;

ALTER TABLE public.admin_orders
  ALTER COLUMN payment_status SET DEFAULT 'Unpaid';

UPDATE public.admin_orders
SET payment_status = CASE
  WHEN payment_status IS NULL THEN 'Unpaid'
  WHEN lower(payment_status) = 'unpaid' THEN 'Unpaid'
  WHEN lower(payment_status) = 'pending verification' THEN 'Pending Verification'
  WHEN lower(payment_status) = 'paid' THEN 'Paid'
  ELSE payment_status
END
WHERE payment_status IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can view checkout orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Anyone can update checkout payment details" ON public.admin_orders;

CREATE POLICY "Anyone can view checkout orders" ON public.admin_orders
  FOR SELECT TO anon, authenticated
  USING (lower(coalesce(payment_status, '')) IN ('unpaid', 'pending verification'));

CREATE POLICY "Anyone can update checkout payment details" ON public.admin_orders
  FOR UPDATE TO anon, authenticated
  USING (lower(coalesce(payment_status, '')) IN ('unpaid', 'pending verification'))
  WITH CHECK (
    payment_status = 'Pending Verification'
    AND payment_method IN ('bkash', 'nagad')
  );

NOTIFY pgrst, 'reload schema';
