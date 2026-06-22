
ALTER TABLE public.admin_products
  ADD COLUMN IF NOT EXISTS thumbnail text,
  ADD COLUMN IF NOT EXISTS offer_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS order_type text,
  ADD COLUMN IF NOT EXISTS search_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS min_order_qty integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_order_qty integer,
  ADD COLUMN IF NOT EXISTS delivery_time text,
  ADD COLUMN IF NOT EXISTS is_free_delivery boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS pos_available boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS website_available boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS warranty text,
  ADD COLUMN IF NOT EXISTS return_policy text,
  ADD COLUMN IF NOT EXISTS attributes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS regular_price numeric,
  ADD COLUMN IF NOT EXISTS sale_price numeric,
  ADD COLUMN IF NOT EXISTS root_sku text;
