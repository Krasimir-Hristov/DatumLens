-- Enable storage policies for the 'documents' bucket

-- 1. Allow public read access to all files in 'documents' bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'documents' );

-- 2. Allow upload access to all files in 'documents' bucket
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'documents' );

-- 3. Allow delete access to all files in 'documents' bucket
create policy "Public Delete"
on storage.objects for delete
using ( bucket_id = 'documents' );
