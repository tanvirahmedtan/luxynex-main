-- Let a customer recover the UUID needed by online payment without granting
-- direct SELECT access to admin_orders. The argument order and names mirror
-- the frontend RPC call exactly.
DROP FUNCTION IF EXISTS public.get_checkout_order(text, text);

CREATE OR REPLACE FUNCTION public.get_checkout_order(
  p_customer_phone text,
  p_order_number text
) RETURNS TABLE(id uuid, order_number text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.order_number
    FROM public.admin_orders AS o
   WHERE o.customer_phone = trim(p_customer_phone)
     AND o.order_number = trim(p_order_number)
   LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_checkout_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_checkout_order(text, text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';