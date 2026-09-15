-- Return the order number from the payment RPC so checkout does not need a
-- direct customer SELECT on admin_orders, which is protected by RLS.
DROP FUNCTION IF EXISTS public.submit_order_payment_details(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.submit_order_payment_details(
  p_order_id uuid,
  p_customer_phone text,
  p_payment_method text,
  p_sender_number text,
  p_transaction_id text
) RETURNS TABLE(order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
BEGIN
  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;

  IF lower(trim(p_payment_method)) NOT IN ('bkash', 'nagad') THEN
    RAISE EXCEPTION 'Unsupported payment method';
  END IF;

  IF length(trim(coalesce(p_sender_number, ''))) = 0
     OR length(trim(coalesce(p_transaction_id, ''))) = 0 THEN
    RAISE EXCEPTION 'Payment details are required';
  END IF;

  UPDATE public.admin_orders
  SET payment_method = lower(trim(p_payment_method))::payment_method,
      sender_number = trim(p_sender_number),
      transaction_id = trim(p_transaction_id),
      payment_details = coalesce(payment_details, '{}'::jsonb) || jsonb_build_object(
        'payment_method', lower(trim(p_payment_method)),
        'sender_number', trim(p_sender_number),
        'transaction_id', trim(p_transaction_id),
        'submitted_at', now()
      ),
      payment_status = 'Pending Verification',
      updated_at = now()
  WHERE id = p_order_id
    AND customer_phone = trim(p_customer_phone)
    AND lower(coalesce(payment_status, '')) IN ('pending', 'unpaid', 'pending verification');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or payment details cannot be updated';
  END IF;

  SELECT o.order_number
    INTO v_order_number
    FROM public.admin_orders AS o
   WHERE o.id = p_order_id;

  RETURN QUERY SELECT v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_order_payment_details(uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_order_payment_details(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_order_payment_details(uuid, text, text, text, text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';