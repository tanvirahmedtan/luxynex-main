-- Keep the existing order validation, stock updates, and item creation while
-- normalizing the RPC response for clients that need the inserted UUID.
ALTER FUNCTION public.place_order(
  text, text, text, text, jsonb, numeric, numeric, text, text
) RENAME TO place_order_legacy;

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address text,
  p_items jsonb,
  p_shipping_fee numeric,
  p_promo_discount_percent numeric,
  p_payment_method text,
  p_notes text
) RETURNS TABLE(id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
  v_id uuid;
BEGIN
  -- The legacy function performs the complete atomic order creation.
  SELECT legacy_order.order_number
    INTO v_order_number
    FROM public.place_order_legacy(
      p_customer_name,
      p_customer_phone,
      p_customer_email,
      p_shipping_address,
      p_items,
      p_shipping_fee,
      p_promo_discount_percent,
      p_payment_method,
      p_notes
    ) AS legacy_order;

  SELECT order_record.id
    INTO v_id
    FROM public.admin_orders AS order_record
    WHERE order_record.order_number = v_order_number
    LIMIT 1;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Order was created without an ID';
  END IF;

  RETURN QUERY SELECT v_id, v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,jsonb,numeric,numeric,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,jsonb,numeric,numeric,text,text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';