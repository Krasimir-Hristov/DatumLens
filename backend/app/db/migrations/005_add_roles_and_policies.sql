-- 1. Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Drop existing RLS policies (we will replace them)
drop policy if exists "Users can select own documents" on documents;
drop policy if exists "Users can insert own documents" on documents;
drop policy if exists "Users can delete own documents" on documents;
drop policy if exists "Users can update own documents" on documents;

drop policy if exists "Users can select own chunks" on document_chunks;
drop policy if exists "Users can insert own chunks" on document_chunks;
drop policy if exists "Users can delete own chunks" on document_chunks;

-- 3. Create new RLS policies for Documents
-- READ: All authenticated users can read all documents
create policy "Allow read access to authenticated users" on documents
  for select to authenticated using (true);

-- WRITE (Insert/Delete/Update): Only Admins can modify
create policy "Allow insert access to admins" on documents
  for insert to authenticated with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Allow delete access to admins" on documents
  for delete to authenticated using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Allow update access to admins" on documents
  for update to authenticated using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 4. Create new RLS policies for Document Chunks
-- READ: All authenticated users can read all chunks
create policy "Allow read access to authenticated users" on document_chunks
  for select to authenticated using (true);

-- WRITE (Insert/Delete): Only Admins can modify (usually via cascade, but good to have)
create policy "Allow insert access to admins" on document_chunks
  for insert to authenticated with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Allow delete access to admins" on document_chunks
  for delete to authenticated using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 5. Update match_documents function to be global
-- Remove the 'AND documents.user_id = auth.uid()' check
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security invoker
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  join documents on document_chunks.document_id = documents.id
  where 
    document_chunks.embedding is not null
    -- No user_id filter here, enabling global search
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 6. Trigger to create profile on user creation (Optional but recommended)
-- This ensures every new user has a profile entry
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error if re-running
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Instructions:
-- 1. Run this SQL in Supabase Dashboard -> SQL Editor
-- 2. Manually update your own user to 'admin' role:
--    UPDATE profiles SET role = 'admin' WHERE email = 'your_email@example.com';
