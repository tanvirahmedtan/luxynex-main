CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.admin_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  selected_color text,
  selected_size text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  product_image text,
  sku text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

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
  item jsonb;
  pid uuid;
  qty int;
  prod record;
  unit_price numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_items jsonb := '[]'::jsonb;
  v_order_number text;
  v_id uuid;
  v_order_item_id uuid;
  v_payment_method_text text;
BEGIN
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Customer name required';
  END IF;
  IF p_customer_phone !~ '^01[3-9][0-9]{8}$' THEN
    RAISE EXCEPTION 'Invalid Bangladeshi phone';
  END IF;
  IF p_customer_email IS NOT NULL AND length(p_customer_email) > 0
     AND p_customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF p_shipping_address IS NULL OR length(trim(p_shipping_address)) < 5 THEN
    RAISE EXCEPTION 'Shipping address too short';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  IF p_shipping_fee < 0 THEN p_shipping_fee := 0; END IF;
  IF p_promo_discount_percent < 0 OR p_promo_discount_percent > 100 THEN
    p_promo_discount_percent := 0;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    pid := NULLIF(item->>'product_id','')::uuid;
    qty := COALESCE((item->>'quantity')::int, 0);
    IF pid IS NULL OR qty <= 0 THEN
      RAISE EXCEPTION 'Invalid cart item';
    END IF;
    SELECT id, name, price, sale_price, stock, images
      INTO prod FROM public.admin_products WHERE id = pid;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', pid;
    END IF;
    IF prod.stock < qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', prod.name;
    END IF;
    unit_price := COALESCE(NULLIF(prod.sale_price,0), prod.price);
    v_subtotal := v_subtotal + (unit_price * qty);
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'product_id', prod.id,
      'name', prod.name,
      'price', unit_price,
      'quantity', qty,
      'image', COALESCE(prod.images[1], ''),
      'selected_color', item->>'selected_color',
      'selected_size', item->>'selected_size',
      'product_name', COALESCE(item->>'product_name', prod.name),
      'unit_price', unit_price,
      'subtotal', unit_price * qty,
      'product_image', item->>'product_image',
      'sku', item->>'sku'
    ));
  END LOOP;

  v_discount := round(v_subtotal * p_promo_discount_percent / 100.0);
  v_total := v_subtotal - v_discount + p_shipping_fee;
  v_order_number := 'LXV-' || to_char(now(),'YYYYMMDD') || '-' || lpad(floor(random()*100000)::text, 5, '0');

  -- Normalize and map incoming payment method text to the DB enum
  v_payment_method_text := lower(trim(coalesce(p_payment_method, '')));
  IF v_payment_method_text = 'online' OR v_payment_method_text = '' THEN
    -- default online to bKash for compatibility with existing enum values
    v_payment_method_text := 'bkash';
  END IF;

  INSERT INTO public.admin_orders(
    order_number, customer_name, customer_phone, customer_email,
    shipping_address, items, subtotal, shipping_fee, discount, total,
    status, payment_method, payment_status, notes
  ) VALUES (
    v_order_number, trim(p_customer_name), p_customer_phone,
    NULLIF(trim(coalesce(p_customer_email,'')), ''),
    p_shipping_address, v_items, v_subtotal, p_shipping_fee, v_discount, v_total,
    'pending'::order_status, v_payment_method_text::payment_method, 'pending', p_notes
  ) RETURNING id INTO v_id;

  FOR item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      selected_color,
      selected_size,
      quantity,
      unit_price,
      subtotal,
      product_image,
      sku
    ) VALUES (
      v_id,
      (item->>'product_id')::uuid,
      COALESCE(item->>'product_name', item->>'name'),
      NULLIF(item->>'selected_color', ''),
      NULLIF(item->>'selected_size', ''),
      COALESCE((item->>'quantity')::int, 1),
      COALESCE((item->>'unit_price')::numeric, 0),
      COALESCE((item->>'subtotal')::numeric, 0),
      NULLIF(item->>'product_image', ''),
      NULLIF(item->>'sku', '')
    );
  END LOOP;

  RETURN QUERY SELECT v_id, v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,jsonb,numeric,numeric,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,jsonb,numeric,numeric,text,text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
