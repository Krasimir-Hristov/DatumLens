"""
Document Service for DatumLens RAG.

This module handles document metadata operations:
- Creating document records
- Listing documents
- Deleting documents (with cascade to chunks)
- File storage operations via Supabase Storage
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
import logging

from app.db.supabase import get_supabase_client

logger = logging.getLogger(__name__)


def create_document_record(
    filename: str,
    storage_path: str,
    file_size: int,
    page_count: int,
    chunk_count: int = 0,
    user_id: Optional[UUID] = None,
    access_token: Optional[str] = None,
) -> dict:
    """
    Creates a new document record in the database.

    Args:
        filename: Original filename (e.g., "contract.pdf")
        storage_path: Path in Supabase Storage bucket
        file_size: File size in bytes
        page_count: Number of pages in the PDF
        chunk_count: Number of chunks created (default 0)
        user_id: Optional user ID for future auth
        access_token: JWT token на потребителя за RLS политики

    Returns:
        The created document record with id
    """
    from app.db.supabase import get_user_supabase_client

    # Използваме user-specific клиент ако имаме токен
    if access_token:
        supabase = get_user_supabase_client(access_token)
    else:
        supabase = get_supabase_client()

    record = {
        "filename": filename,
        "storage_path": storage_path,
        "file_size": file_size,
        "page_count": page_count,
        "chunk_count": chunk_count,
    }

    if user_id:
        record["user_id"] = str(user_id)

    response = supabase.table("documents").insert(record).execute()

    if response.data:
        logger.info(
            f"Created document record: {filename} with ID {response.data[0]['id']}"
        )
        return response.data[0]

    raise Exception("Failed to create document record")


def update_document_chunk_count(
    document_id: UUID, chunk_count: int, access_token: Optional[str] = None
) -> dict:
    """
    Updates the chunk count for a document.

    Args:
        document_id: The document UUID
        chunk_count: New chunk count
        access_token: JWT token на потребителя за RLS политики

    Returns:
        Updated document record
    """
    from app.db.supabase import get_user_supabase_client

    # Използваме user-specific клиент ако имаме токен
    if access_token:
        supabase = get_user_supabase_client(access_token)
    else:
        supabase = get_supabase_client()

    response = (
        supabase.table("documents")
        .update({"chunk_count": chunk_count})
        .eq("id", str(document_id))
        .execute()
    )

    if response.data:
        return response.data[0]

    raise Exception(f"Failed to update document {document_id}")


def list_documents(
    user_id: Optional[UUID] = None, access_token: Optional[str] = None
) -> List[dict]:
    """
    Lists all documents, optionally filtered by user.

    Args:
        user_id: Optional filter by user (for future auth)
        access_token: JWT token на потребителя за RLS политики

    Returns:
        List of document records
    """
    from app.db.supabase import get_user_supabase_client

    # Използваме user-specific клиент ако имаме токен
    if access_token:
        supabase = get_user_supabase_client(access_token)
    else:
        supabase = get_supabase_client()

    query = supabase.table("documents").select("*").order("uploaded_at", desc=True)

    # if user_id:
    #     query = query.eq("user_id", str(user_id))

    response = query.execute()

    return response.data or []


def get_all_doc_names(access_token: Optional[str] = None) -> List[str]:
    """
    Retrieves a list of all document filenames.

    Args:
        access_token: JWT token на потребителя за RLS политики

    Returns:
        List of strings (filenames)
    """
    from app.db.supabase import get_user_supabase_client

    # Използваме user-specific клиент ако имаме токен
    if access_token:
        supabase = get_user_supabase_client(access_token)
    else:
        supabase = get_supabase_client()

    response = (
        supabase.table("documents").select("filename").order("filename").execute()
    )

    if not response.data:
        return []

    return [doc["filename"] for doc in response.data]


def get_document_by_id(
    document_id: UUID, access_token: Optional[str] = None
) -> Optional[dict]:
    """
    Gets a single document by ID.

    Args:
        document_id: The document UUID
        access_token: JWT token на потребителя за RLS политики

    Returns:
        Document record or None if not found
    """
    from app.db.supabase import get_user_supabase_client

    # Използваме user-specific клиент ако имаме токен
    if access_token:
        supabase = get_user_supabase_client(access_token)
    else:
        supabase = get_supabase_client()

    response = (
        supabase.table("documents")
        .select("*")
        .eq("id", str(document_id))
        .single()
        .execute()
    )

    return response.data


def get_document_by_filename(filename: str) -> Optional[dict]:
    """
    Gets a document by filename.

    Args:
        filename: The document filename

    Returns:
        Document record or None if not found
    """
    supabase = get_supabase_client()

    response = (
        supabase.table("documents").select("*").eq("filename", filename).execute()
    )

    if response.data:
        return response.data[0]

    return None


def delete_document(document_id: UUID, access_token: Optional[str] = None) -> dict:
    """
    Deletes a document and all its chunks (via cascade).
    Also removes the file from storage.

    Args:
        document_id: The document UUID to delete
        access_token: JWT token на потребителя за RLS политики

    Returns:
        Success message with deleted counts
    """
    from app.db.supabase import get_user_supabase_client

    # Използваме user-specific клиент ако имаме токен
    if access_token:
        supabase = get_user_supabase_client(access_token)
    else:
        supabase = get_supabase_client()

    # First, get the document to find the storage path
    doc = get_document_by_id(document_id, access_token)
    if not doc:
        raise Exception(f"Document {document_id} not found")

    storage_path = doc.get("storage_path")
    filename = doc.get("filename")

    # Count chunks before deletion (for reporting)
    chunks_response = (
        supabase.table("document_chunks")
        .select("id", count="exact")
        .eq("document_id", str(document_id))
        .execute()
    )
    chunk_count = len(chunks_response.data) if chunks_response.data else 0

    # Delete from storage if path exists
    if storage_path:
        try:
            supabase.storage.from_("documents").remove([storage_path])
            logger.info(f"Deleted file from storage: {storage_path}")
        except Exception as e:
            logger.warning(f"Failed to delete from storage: {e}")

    # Delete document (chunks will cascade delete due to FK)
    supabase.table("documents").delete().eq("id", str(document_id)).execute()

    logger.info(f"Deleted document {filename} with {chunk_count} chunks")

    return {
        "success": True,
        "document_id": str(document_id),
        "filename": filename,
        "chunks_deleted": chunk_count,
        "message": f"Successfully deleted '{filename}' and {chunk_count} chunks",
    }


def delete_document_by_filename(filename: str) -> dict:
    """
    Deletes a document by filename.
    Wrapper around delete_document for backward compatibility.

    Args:
        filename: The document filename

    Returns:
        Success message with deleted counts
    """
    doc = get_document_by_filename(filename)

    if not doc:
        return {
            "success": False,
            "chunks_deleted": 0,
            "message": f"Document '{filename}' not found",
        }

    return delete_document(doc["id"])


def upload_file_to_storage(
    file_bytes: bytes, filename: str, user_id: Optional[str] = None
) -> str:
    """
    Uploads a file to Supabase Storage.

    Args:
        file_bytes: The file content as bytes
        filename: Original filename
        user_id: Optional user ID to namespace the file

    Returns:
        The storage path where the file was saved
    """
    supabase = get_supabase_client()

    # Generate unique storage path with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Remove special characters from filename
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-")

    if user_id:
        storage_path = f"{user_id}/{timestamp}_{safe_filename}"
    else:
        storage_path = f"{timestamp}_{safe_filename}"

    # Upload to the 'documents' bucket
    try:
        supabase.storage.from_("documents").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": "application/pdf"},
        )
        logger.info(f"Uploaded file to storage: {storage_path}")
        return storage_path
    except Exception as e:
        logger.error(f"Failed to upload to storage: {e}")
        raise


def get_file_from_storage(storage_path: str) -> bytes:
    """
    Downloads a file from Supabase Storage.

    Args:
        storage_path: The path in storage

    Returns:
        File content as bytes
    """
    supabase = get_supabase_client()

    try:
        response = supabase.storage.from_("documents").download(storage_path)
        return response
    except Exception as e:
        logger.error(f"Failed to download from storage: {e}")
        raise


def get_file_public_url(storage_path: str) -> str:
    """
    Gets the public URL for a file in storage.

    Args:
        storage_path: The path in storage

    Returns:
        Public URL string
    """
    supabase = get_supabase_client()

    return supabase.storage.from_("documents").get_public_url(storage_path)
