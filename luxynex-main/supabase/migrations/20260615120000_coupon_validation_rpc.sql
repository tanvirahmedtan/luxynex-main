CREATE OR REPLACE FUNCTION public.validate_coupon_code(
  p_code text,
  p_subtotal numeric
) RETURNS TABLE(
  is_valid boolean,
  message text,
  coupon_id uuid,
  code text,
  discount_percent numeric,
  discount_amount numeric,
  min_order_amount numeric,
  final_discount_amount numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_code text := upper(trim(coalesce(p_code, '')));
  v_discount_amount numeric := 0;
BEGIN
  IF v_code = '' THEN
    RETURN QUERY SELECT false, 'Enter a coupon code', NULL::uuid, NULL::text, 0::numeric, 0::numeric, 0::numeric, 0::numeric;
    RETURN;
  END IF;

  SELECT *
    INTO v_coupon
    FROM public.coupons
   WHERE upper(trim(code)) = v_code
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid coupon code', NULL::uuid, NULL::text, 0::numeric, 0::numeric, 0::numeric, 0::numeric;
    RETURN;
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN QUERY SELECT false, 'This coupon is inactive', v_coupon.id, v_coupon.code, v_coupon.discount_percent, v_coupon.discount_amount, v_coupon.min_order_amount, 0::numeric;
    RETURN;
  END IF;

  IF p_subtotal < v_coupon.min_order_amount THEN
    RETURN QUERY SELECT false, format('Minimum order for this coupon is ৳%s', v_coupon.min_order_amount), v_coupon.id, v_coupon.code, v_coupon.discount_percent, v_coupon.discount_amount, v_coupon.min_order_amount, 0::numeric;
    RETURN;
  END IF;

  IF COALESCE(v_coupon.discount_percent, 0) > 0 THEN
    v_discount_amount := round((p_subtotal * v_coupon.discount_percent) / 100.0);
  ELSE
    v_discount_amount := LEAST(COALESCE(v_coupon.discount_amount, 0), p_subtotal);
  END IF;

  IF v_discount_amount <= 0 THEN
    RETURN QUERY SELECT false, 'This coupon does not provide any discount', v_coupon.id, v_coupon.code, v_coupon.discount_percent, v_coupon.discount_amount, v_coupon.min_order_amount, 0::numeric;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'Coupon applied successfully', v_coupon.id, v_coupon.code, v_coupon.discount_percent, v_coupon.discount_amount, v_coupon.min_order_amount, v_discount_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_coupon_code(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(text, numeric) TO anon, authenticated;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can view all coupons" ON public.coupons;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all coupons"
  ON public.coupons FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

NOTIFY pgrst, 'reload schema';