-- DatumLens RAG Schema
-- This file serves as a reference and for initial database initialization.

-- 1. Enable the vector extension (pgvector)
-- This allows the database to understand and search vectors.
create extension if not exists vector;

-- 2. Enable the UUID generation extension
create extension if not exists "uuid-ossp";

-- 3. Create the table for text chunks
create table if not exists document_chunks (
  id uuid primary key default uuid_generate_v4(),
  content text not null,               -- The actual text content
  metadata jsonb not null default '{}', -- Metadata (page number, filename, etc.)
  embedding vector(1536),              -- The vector embedding (1536 is OpenAI's dimension)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create an index for faster search (HNSW)
-- This makes similarity search very fast even with millions of records.
create index on document_chunks using hnsw (embedding vector_cosine_ops);

-- 5. Enable Row Level Security (RLS)
alter table document_chunks enable row level security;

-- 6. Access Policies (RLS Policies)
-- WARNING: For testing purposes, we allow public access.
-- In production, these policies should be restricted to authenticated users!

-- Allow public read access (for searching)
create policy "Allow public read access"
  on document_chunks
  for select
  to public
  using (true);

-- Allow public insert access (for uploading)
create policy "Allow public insert access"
  on document_chunks
  for insert
  to public
  with check (true);
