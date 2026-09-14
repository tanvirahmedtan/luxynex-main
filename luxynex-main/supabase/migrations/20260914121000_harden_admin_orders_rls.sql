ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admin_orders
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

DROP POLICY IF EXISTS "Admins can view orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Anyone can view checkout orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Anyone can update checkout payment details" ON public.admin_orders;

CREATE POLICY "Admins can view orders" ON public.admin_orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Customer checkout uses the SECURITY DEFINER place_order RPC. Direct client
-- inserts remain admin-only so callers cannot forge order totals or stock data.
CREATE POLICY "Admins can insert orders" ON public.admin_orders
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.admin_orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.admin_orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view checkout orders" ON public.admin_orders
  FOR SELECT TO anon, authenticated
  USING (
    lower(coalesce(payment_status, '')) IN
      ('pending', 'unpaid', 'pending verification')
  );

CREATE POLICY "Anyone can update checkout payment details" ON public.admin_orders
  FOR UPDATE TO anon, authenticated
  USING (
    lower(coalesce(payment_status, '')) IN
      ('pending', 'unpaid', 'pending verification')
  )
  WITH CHECK (
    payment_status = 'Pending Verification'
    AND payment_method IN ('bkash', 'nagad')
    AND sender_number IS NOT NULL
    AND transaction_id IS NOT NULL
  );

NOTIFY pgrst, 'reload schema';