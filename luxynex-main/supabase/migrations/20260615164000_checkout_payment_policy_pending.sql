ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view checkout orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Anyone can update checkout payment details" ON public.admin_orders;

CREATE POLICY "Anyone can view checkout orders" ON public.admin_orders
  FOR SELECT TO anon, authenticated
  USING (lower(coalesce(payment_status, '')) IN ('pending', 'unpaid', 'pending verification'));

CREATE POLICY "Anyone can update checkout payment details" ON public.admin_orders
  FOR UPDATE TO anon, authenticated
  USING (lower(coalesce(payment_status, '')) IN ('pending', 'unpaid', 'pending verification'))
  WITH CHECK (
    payment_status = 'Pending Verification'
    AND payment_method IN ('bkash', 'nagad')
    AND sender_number IS NOT NULL
    AND transaction_id IS NOT NULL
  );

NOTIFY pgrst, 'reload schema';
