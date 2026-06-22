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
  SET payment_method = lower(trim(p_payment_method))::payment_method,
      sender_number = NULLIF(trim(p_sender_number), ''),
      transaction_id = NULLIF(trim(p_transaction_id), ''),
      payment_status = 'Pending Verification'
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_order_payment_details(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_order_payment_details(uuid, text, text, text) TO anon, authenticated;

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
    AND sender_number IS NOT NULL
    AND transaction_id IS NOT NULL
  );

NOTIFY pgrst, 'reload schema';
