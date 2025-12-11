from langchain_core.documents import Document
from typing import List, Optional
from app.db.supabase import get_supabase_client


def save_chunks_to_database(
    chunks: List[Document], document_id: Optional[str] = None
) -> dict:
    """
    Saves processed chunks with their embeddings to the Supabase database.

    Args:
        chunks: List of Document objects with embeddings in metadata
        document_id: Optional UUID of the parent document (for FK relationship)

    Returns:
        Dictionary with success status and count of saved chunks

    How it works:
    1. Connects to Supabase
    2. For each chunk:
       - Extracts text, metadata, and embedding
       - Inserts into the document_chunks table with document_id reference
    3. Returns confirmation

    Database schema reminder:
    - id: UUID (auto-generated)
    - document_id: UUID (foreign key to documents table)
    - content: text (the chunk text)
    - metadata: jsonb (source_filename, page_number, chunk_index, etc.)
    - embedding: vector(1536) (the OpenAI embedding)
    - created_at: timestamp (auto-generated)
    """

    supabase = get_supabase_client()

    # Prepare data for insertion
    records_to_insert = []

    for chunk in chunks:
        # Extract embedding from metadata (we put it there in step 2.4)
        embedding = chunk.metadata.get("embedding")

        # Remove embedding from metadata before storing
        # (we'll store it in a separate column, not in the JSON)
        metadata_copy = chunk.metadata.copy()
        if "embedding" in metadata_copy:
            del metadata_copy["embedding"]
        # Also remove document_id from metadata (it's stored in a separate column)
        if "document_id" in metadata_copy:
            del metadata_copy["document_id"]

        # Create a record for the database
        record = {
            "content": chunk.page_content,
            "metadata": metadata_copy,  # This will be stored as JSON
            "embedding": embedding,  # This will be stored as a vector
        }

        # Add document_id if provided
        if document_id:
            record["document_id"] = document_id

        records_to_insert.append(record)

    # Insert all records into the database
    # Supabase handles the UUIDs and timestamps automatically
    supabase.table("document_chunks").insert(records_to_insert).execute()

    return {
        "success": True,
        "chunks_saved": len(records_to_insert),
        "message": f"Successfully saved {len(records_to_insert)} chunks to database",
    }


def delete_document_by_filename(filename: str) -> dict:
    """
    Deletes all chunks associated with a specific document filename.

    Args:
        filename: The source_filename to delete

    Returns:
        Dictionary with success status and count of deleted chunks
    """
    supabase = get_supabase_client()

    # Fetch all chunks
    all_chunks = supabase.table("document_chunks").select("id, metadata").execute()

    # Filter in Python
    ids_to_delete = []
    for chunk in all_chunks.data:
        meta = chunk.get("metadata", {})
        if meta.get("source_filename") == filename:
            ids_to_delete.append(chunk["id"])

    # Delete by IDs
    deleted_count = 0
    if ids_to_delete:
        for chunk_id in ids_to_delete:
            supabase.table("document_chunks").delete().eq("id", chunk_id).execute()
            deleted_count += 1

    return {
        "success": True,
        "chunks_deleted": deleted_count,
        "message": f"Deleted {deleted_count} chunks for document: {filename}",
    }
