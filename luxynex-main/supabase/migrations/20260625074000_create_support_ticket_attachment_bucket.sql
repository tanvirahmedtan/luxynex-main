INSERT INTO storage.buckets (id, name, public)
VALUES ('support-ticket-attachments', 'support-ticket-attachments', true)
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
