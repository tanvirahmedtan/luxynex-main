-- Associate future RPC-created orders with the authenticated customer while
-- retaining guest checkout and safely exposing legacy matching orders.
ALTER TABLE public.admin_orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.set_order_customer_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_order_customer_user ON public.admin_orders;
CREATE TRIGGER trg_set_order_customer_user
  BEFORE INSERT ON public.admin_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_customer_user();

CREATE OR REPLACE FUNCTION public.get_customer_orders()
RETURNS SETOF public.admin_orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.*
    FROM public.admin_orders AS o
   WHERE auth.uid() IS NOT NULL
     AND (
       o.user_id = auth.uid()
       OR lower(coalesce(o.customer_email, '')) = lower(coalesce(auth.jwt()->>'email', ''))
       OR o.customer_phone = (
         SELECT p.phone
           FROM public.profiles AS p
          WHERE p.user_id = auth.uid()
       )
     )
   ORDER BY o.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_customer_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_customer_orders() TO authenticated;

NOTIFY pgrst, 'reload schema';