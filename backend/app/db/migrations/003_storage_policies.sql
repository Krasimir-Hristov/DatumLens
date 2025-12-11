-- Storage Policies for 'documents' bucket
-- These ensure users can only access files in their own folder (named after their UUID)

-- Note: Ensure the 'documents' bucket is Private in the dashboard.

-- 1. Policy: Authenticated users can upload to their own folder
-- Path structure: {user_id}/{filename}
create policy "Users can upload their own documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Policy: Authenticated users can view their own documents
create policy "Users can view their own documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Policy: Authenticated users can delete their own documents
create policy "Users can delete their own documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
