
-- Create storage buckets for backups and reports
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('backups', 'backups', true),
  ('reports', 'reports', true);

-- Create policies for backups bucket
CREATE POLICY "Allow authenticated users to upload backups" ON storage.objects
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'backups');

CREATE POLICY "Allow authenticated users to view backups" ON storage.objects
  FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'backups');

CREATE POLICY "Allow public access to backups" ON storage.objects
  FOR SELECT 
  TO public 
  USING (bucket_id = 'backups');

-- Create policies for reports bucket  
CREATE POLICY "Allow authenticated users to upload reports" ON storage.objects
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow authenticated users to view reports" ON storage.objects
  FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'reports');

CREATE POLICY "Allow public access to reports" ON storage.objects
  FOR SELECT 
  TO public 
  USING (bucket_id = 'reports');
