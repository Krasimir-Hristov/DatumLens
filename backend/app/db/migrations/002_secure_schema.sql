-- Secure Schema Migration
-- Enables Row Level Security (RLS) and updates search function for tenant isolation.

-- 1. Drop insecure public policies (from initial schema)
DROP POLICY IF EXISTS "Allow public read access on documents" ON documents;
DROP POLICY IF EXISTS "Allow public insert access on documents" ON documents;
DROP POLICY IF EXISTS "Allow public delete access on documents" ON documents;

DROP POLICY IF EXISTS "Allow public read access" ON document_chunks;
DROP POLICY IF EXISTS "Allow public insert access" ON document_chunks;
DROP POLICY IF EXISTS "Allow public delete access" ON document_chunks;

-- 2. Create secure policies for 'documents' table
-- Restricts access to rows where user_id matches the authenticated user.
CREATE POLICY "Users can select own documents" ON documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 3. Create secure policies for 'document_chunks' table
-- Users access chunks via their parent document connection.
CREATE POLICY "Users can select own chunks" ON document_chunks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own chunks" ON document_chunks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can delete own chunks" ON document_chunks
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- 4. Update vector search function to respect user ownership
-- Adds a JOIN to the documents table and filters by auth.uid()
-- First drop all existing versions of the function
DROP FUNCTION IF EXISTS match_documents(vector(1536), int);
DROP FUNCTION IF EXISTS match_documents(vector(1536), int, jsonb);

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  JOIN documents ON document_chunks.document_id = documents.id
  WHERE 
    document_chunks.embedding IS NOT NULL
    AND documents.user_id = auth.uid() -- Critical security filter
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
