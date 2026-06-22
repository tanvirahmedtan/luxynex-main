ALTER TABLE public.admin_orders
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
END;

CREATE OR REPLACE FUNCTION public.submit_order_payment_details(
  p_order_id uuid,
  p_payment_method text,
  p_sender_number text,
  p_transaction_id text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_orders
  SET payment_method = p_payment_method::payment_method,
      sender_number = NULLIF(trim(p_sender_number), ''),
      transaction_id = NULLIF(trim(p_transaction_id), ''),
      payment_status = 'Pending Verification'
  WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_order_payment_details(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_order_payment_details(uuid, text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_order_paid(p_order_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.admin_orders
  SET payment_status = 'Paid'
  WHERE id = p_order_id;
$$;

REVOKE ALL ON FUNCTION public.set_order_paid(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_order_paid(uuid) TO authenticated;

ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.admin_orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.admin_orders;

CREATE POLICY "Admins can view orders" ON public.admin_orders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert orders" ON public.admin_orders
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.admin_orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.admin_orders
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

NOTIFY pgrst, 'reload schema';