-- ============================================
-- DatumLens: Migration for Documents Table
-- Run this in Supabase SQL Editor
-- Date: 2025-12-11
-- ============================================

-- 1. Create the documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  page_count INTEGER,
  chunk_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID
);

-- 2. Add document_id column to document_chunks if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'document_chunks' AND column_name = 'document_id'
  ) THEN
    ALTER TABLE document_chunks 
    ADD COLUMN document_id UUID REFERENCES documents(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for documents table
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow public read access on documents" ON documents;
  DROP POLICY IF EXISTS "Allow public insert access on documents" ON documents;
  DROP POLICY IF EXISTS "Allow public delete access on documents" ON documents;
  DROP POLICY IF EXISTS "Allow public update access on documents" ON documents;
END $$;

-- Allow public read access
CREATE POLICY "Allow public read access on documents"
  ON documents
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access on documents"
  ON documents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access on documents"
  ON documents
  FOR DELETE
  TO public
  USING (true);

-- Allow public update access (for updating chunk_count)
CREATE POLICY "Allow public update access on documents"
  ON documents
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 5. Create index on document_id for faster joins
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
ON document_chunks(document_id);

-- 6. Add delete policy to document_chunks if not exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public delete access" ON document_chunks;
END $$;

CREATE POLICY "Allow public delete access"
  ON document_chunks
  FOR DELETE
  TO public
  USING (true);

-- ============================================
-- IMPORTANT: After running this SQL, you also need to:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket called "documents"
-- 3. Make it public (or configure proper RLS)
-- ============================================

-- Verify the tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('documents', 'document_chunks');
