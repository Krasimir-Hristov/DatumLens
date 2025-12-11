-- DatumLens RAG Schema
-- This file serves as a reference and for initial database initialization.

-- 1. Enable the vector extension (pgvector)
-- This allows the database to understand and search vectors.
create extension if not exists vector;

-- 2. Enable the UUID generation extension
create extension if not exists "uuid-ossp";

-- 3. Create the documents table (Added: 2025-12-11)
-- This tracks all uploaded PDF files
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,                -- Original filename (e.g., "contract.pdf")
  storage_path text not null,            -- Path in Supabase Storage bucket
  file_size bigint,                      -- File size in bytes
  page_count integer,                    -- Number of pages in the PDF
  chunk_count integer default 0,         -- Number of chunks created from this document
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid                           -- For future auth integration (nullable for now)
);

-- 4. Create the table for text chunks
create table if not exists document_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id) on delete cascade,  -- Link to parent document
  content text not null,               -- The actual text content
  metadata jsonb not null default '{}', -- Metadata (page number, filename, etc.)
  embedding vector(1536),              -- The vector embedding (1536 is OpenAI's dimension)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create an index for faster search (HNSW)
-- This makes similarity search very fast even with millions of records.
create index on document_chunks using hnsw (embedding vector_cosine_ops);

-- 6. Enable Row Level Security (RLS)
alter table documents enable row level security;
alter table document_chunks enable row level security;

-- 7. Access Policies (RLS Policies)
-- WARNING: For testing purposes, we allow public access.
-- In production, these policies should be restricted to authenticated users!

-- Documents table policies
create policy "Allow public read access on documents"
  on documents
  for select
  to public
  using (true);

create policy "Allow public insert access on documents"
  on documents
  for insert
  to public
  with check (true);

create policy "Allow public delete access on documents"
  on documents
  for delete
  to public
  using (true);

-- Document chunks table policies
create policy "Allow public read access"
  on document_chunks
  for select
  to public
  using (true);

create policy "Allow public insert access"
  on document_chunks
  for insert
  to public
  with check (true);

create policy "Allow public delete access"
  on document_chunks
  for delete
  to public
  using (true);

-- 8. Full-Text Search Index
-- This enables fast searching by keywords (like Google search)
create index if not exists document_chunks_content_fts_idx 
on document_chunks 
using gin(to_tsvector('simple', content));

-- 9. Index on document_id for faster joins
create index if not exists document_chunks_document_id_idx
on document_chunks(document_id);

-- 10. Vector Similarity Search Function
-- This function compares a query embedding with all stored embeddings
-- and returns the most similar chunks
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.embedding is not null
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
