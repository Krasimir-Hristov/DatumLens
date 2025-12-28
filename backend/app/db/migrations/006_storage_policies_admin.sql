-- 1. Reset Storage Policies for 'documents' bucket
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;
drop policy if exists "Users can upload their own documents" on storage.objects;
drop policy if exists "Users can view their own documents" on storage.objects;
drop policy if exists "Users can delete their own documents" on storage.objects;

-- 2. Allow Read Access (Everyone can download/view files)
create policy "Allow public read access"
on storage.objects for select
to authenticated
using ( bucket_id = 'documents' );

-- 3. Allow Admin Upload Access
-- Only users with role 'admin' in public.profiles can upload
create policy "Allow admin upload access"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- 4. Allow Admin Delete Access
create policy "Allow admin delete access"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents' AND
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
