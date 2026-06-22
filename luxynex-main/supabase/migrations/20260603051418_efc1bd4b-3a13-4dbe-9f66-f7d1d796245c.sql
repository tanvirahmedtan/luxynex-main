CREATE UNIQUE INDEX IF NOT EXISTS admin_customers_phone_key
  ON public.admin_customers (phone);

CREATE OR REPLACE FUNCTION public.sync_order_side_effects()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  pid uuid;
  qty int;
BEGIN
  INSERT INTO public.admin_customers (name, phone, email, address, total_orders, total_spent)
  VALUES (NEW.customer_name, NEW.customer_phone, NEW.customer_email,
          NEW.shipping_address, 1, NEW.total)
  ON CONFLICT (phone) DO UPDATE
  SET name = EXCLUDED.name,
      email = COALESCE(EXCLUDED.email, admin_customers.email),
      address = EXCLUDED.address,
      total_orders = admin_customers.total_orders + 1,
      total_spent = admin_customers.total_spent + EXCLUDED.total_spent,
      updated_at = now();

  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
    pid := NULLIF(item->>'product_id', '')::uuid;
    qty := COALESCE((item->>'quantity')::int, 0);
    IF pid IS NOT NULL AND qty > 0 THEN
      UPDATE public.admin_products
      SET stock = GREATEST(stock - qty, 0)
      WHERE id = pid;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_orders_side_effects ON public.admin_orders;
CREATE TRIGGER trg_admin_orders_side_effects
AFTER INSERT ON public.admin_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_order_side_effects();