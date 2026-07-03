
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
) RETURNS TABLE(order_number text)
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
  v_selected_variant text;
  v_color text;
  v_size text;
  v_item_obj jsonb;
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
    v_selected_variant := NULLIF(item->>'selected_variant', '')::text;
    
    IF pid IS NULL OR qty <= 0 THEN
      RAISE EXCEPTION 'Invalid cart item';
    END IF;
    SELECT id, name, price, sale_price, stock, images, thumbnail
      INTO prod FROM public.admin_products WHERE id = pid;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', pid;
    END IF;
    IF prod.stock < qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', prod.name;
    END IF;
    
    unit_price := COALESCE(NULLIF(prod.sale_price,0), prod.price);
    v_subtotal := v_subtotal + (unit_price * qty);
    
    -- Parse selected_variant string to extract color and size
    -- Format: "Color: White | Size: M" or just "Color: White" or "Size: M"
    v_color := NULL;
    v_size := NULL;
    
    IF v_selected_variant IS NOT NULL THEN
      -- Extract color: match "Color: <value>"
      v_color := (regexp_matches(v_selected_variant, 'Color:\s*([^|]+)', 'g'))[1];
      IF v_color IS NOT NULL THEN
        v_color := trim(v_color);
        IF v_color = '' THEN v_color := NULL; END IF;
      END IF;
      
      -- Extract size: match "Size: <value>"
      v_size := (regexp_matches(v_selected_variant, 'Size:\s*([^|]+)', 'g'))[1];
      IF v_size IS NOT NULL THEN
        v_size := trim(v_size);
        IF v_size = '' THEN v_size := NULL; END IF;
      END IF;
    END IF;
    
    v_item_obj := jsonb_build_object(
      'product_id', prod.id,
      'name', prod.name,
      'price', unit_price,
      'quantity', qty,
      'image', COALESCE(prod.thumbnail, prod.images[1], '')
    );
    
    -- Add color and size if they exist (locked at purchase time)
    IF v_color IS NOT NULL THEN
      v_item_obj := v_item_obj || jsonb_build_object('color', v_color);
    END IF;
    IF v_size IS NOT NULL THEN
      v_item_obj := v_item_obj || jsonb_build_object('size', v_size);
    END IF;
    
    v_items := v_items || jsonb_build_array(v_item_obj);
    
    -- DECREMENT STOCK: Update product stock after validation
    UPDATE public.admin_products
    SET stock = stock - qty, updated_at = now()
    WHERE id = pid;
  END LOOP;

  v_discount := round(v_subtotal * p_promo_discount_percent / 100.0);
  v_total := v_subtotal - v_discount + p_shipping_fee;
  v_order_number := 'LXV-' || to_char(now(),'YYYYMMDD') || '-' || lpad(floor(random()*100000)::text, 5, '0');

  INSERT INTO public.admin_orders(
    order_number, customer_name, customer_phone, customer_email,
    shipping_address, items, subtotal, shipping_fee, discount, total,
    status, payment_method, payment_status, notes
  ) VALUES (
    v_order_number, trim(p_customer_name), p_customer_phone,
    NULLIF(trim(coalesce(p_customer_email,'')), ''),
    p_shipping_address, v_items, v_subtotal, p_shipping_fee, v_discount, v_total,
    'pending'::order_status, p_payment_method::payment_method, 'pending', p_notes
  ) RETURNING id INTO v_id;

  RETURN QUERY SELECT v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,jsonb,numeric,numeric,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,jsonb,numeric,numeric,text,text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
