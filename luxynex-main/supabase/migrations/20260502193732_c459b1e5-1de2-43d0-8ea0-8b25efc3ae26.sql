ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_categories;
ALTER TABLE public.admin_products REPLICA IDENTITY FULL;
ALTER TABLE public.admin_categories REPLICA IDENTITY FULL;