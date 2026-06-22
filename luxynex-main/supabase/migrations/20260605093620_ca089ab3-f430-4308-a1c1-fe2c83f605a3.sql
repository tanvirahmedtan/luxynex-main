
-- =============== get_order_tracking ===============
CREATE OR REPLACE FUNCTION public.get_order_tracking(p_order_number text, p_phone text)
RETURNS TABLE(
  order_number text,
  status order_status,
  payment_status text,
  payment_method payment_method,
  total numeric,
  customer_name text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_number, o.status, o.payment_status, o.payment_method,
         o.total, o.customer_name, o.created_at
  FROM public.admin_orders o
  WHERE upper(trim(o.order_number)) = upper(trim(p_order_number))
    AND regexp_replace(o.customer_phone, '\D', '', 'g')
        = regexp_replace(trim(p_phone), '\D', '', 'g')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_tracking(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(text, text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- =============== coupons table ===============
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  discount_percent numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  min_order_amount numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all coupons"
  ON public.coupons FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert coupons"
  ON public.coupons FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update coupons"
  ON public.coupons FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coupons"
  ON public.coupons FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.coupons (code, description, discount_percent, min_order_amount)
VALUES
  ('LUXE10', 'Get 10% off on this order', 10, 0),
  ('FIRST15', '15% off for first-time customers', 15, 0),
  ('GLOW20', 'Flat 20% off above ৳2000', 20, 2000)
ON CONFLICT (code) DO NOTHING;
