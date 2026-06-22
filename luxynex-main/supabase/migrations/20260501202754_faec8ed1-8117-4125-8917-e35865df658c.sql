
-- BANNERS
CREATE TABLE public.admin_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text,
  image_url text NOT NULL,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners" ON public.admin_banners
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all banners" ON public.admin_banners
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert banners" ON public.admin_banners
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update banners" ON public.admin_banners
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete banners" ON public.admin_banners
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_admin_banners_updated
  BEFORE UPDATE ON public.admin_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POPUPS
CREATE TABLE public.admin_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text,
  image_url text,
  button_text text,
  button_link text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active popups" ON public.admin_popups
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all popups" ON public.admin_popups
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert popups" ON public.admin_popups
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update popups" ON public.admin_popups
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete popups" ON public.admin_popups
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_admin_popups_updated
  BEFORE UPDATE ON public.admin_popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CATEGORIES (with unlimited subcategories via parent_id)
CREATE TABLE public.admin_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES public.admin_categories(id) ON DELETE CASCADE,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_categories_parent ON public.admin_categories(parent_id);
ALTER TABLE public.admin_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.admin_categories
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all categories" ON public.admin_categories
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert categories" ON public.admin_categories
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.admin_categories
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.admin_categories
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_admin_categories_updated
  BEFORE UPDATE ON public.admin_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add subcategory_id to products (optional)
ALTER TABLE public.admin_products
  ADD COLUMN subcategory_id uuid REFERENCES public.admin_categories(id) ON DELETE SET NULL;

-- Storage bucket for banners & popups
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Banner images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Admins upload banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update banners" ON storage.objects
  FOR UPDATE USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'));
