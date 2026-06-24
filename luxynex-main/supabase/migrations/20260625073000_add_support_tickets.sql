CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved');

CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  status ticket_status NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support tickets may be read by owner or admin" ON public.support_tickets
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create support tickets" ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update support tickets" ON public.support_tickets
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete support tickets" ON public.support_tickets
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('support-ticket-attachments', 'support-ticket-attachments', true)
  ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view support ticket attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'support-ticket-attachments');

CREATE POLICY "Authenticated users can upload support ticket attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'support-ticket-attachments' AND auth.role() IS NOT NULL);

CREATE POLICY "Authenticated users can update support ticket attachments" ON storage.objects
  FOR UPDATE USING (bucket_id = 'support-ticket-attachments' AND auth.role() IS NOT NULL);

CREATE POLICY "Authenticated users can delete support ticket attachments" ON storage.objects
  FOR DELETE USING (bucket_id = 'support-ticket-attachments' AND auth.role() IS NOT NULL);

NOTIFY pgrst, 'reload schema';
