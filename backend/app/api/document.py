"""
Document API endpoints for DatumLens RAG.

This module provides endpoints for:
- Uploading PDF documents (with storage + chunking)
- Listing all documents
- Deleting documents (with cascade)
- Getting document details
- Downloading original PDFs
"""

import logging
from uuid import UUID

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, Response

from app.services.document_processor import (
    load_pdf_from_bytes,
    chunk_documents,
    create_embeddings_for_chunks,
)
from app.services.storage import save_chunks_to_database
from app.services.document_service import (
    create_document_record,
    update_document_chunk_count,
    list_documents as list_docs_service,
    get_document_by_id,
    delete_document as delete_doc_service,
    delete_document_by_filename,
    upload_file_to_storage,
    get_file_from_storage,
    get_file_public_url,
)

logger = logging.getLogger(__name__)

# Create a router for document-related endpoints
router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document, store it, and process it for RAG.

    Steps:
    1. Validate the file (must be PDF)
    2. Read the file bytes
    3. Upload to Supabase Storage
    4. Create document record in database
    5. Load PDF and extract pages
    6. Chunk the pages using AI semantic chunking
    7. Create embeddings for each chunk
    8. Save chunks to database with document_id reference
    9. Update document with chunk count

    Returns:
        Success message with document ID and chunk count
    """
    # Step 1: Validate file type
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        logger.info(f"Starting upload for file: {file.filename}")

        # Step 2: Read the uploaded file into memory
        file_bytes = await file.read()
        file_size = len(file_bytes)
        logger.info(f"File read successfully. Size: {file_size} bytes")

        # Step 3: Upload to Supabase Storage
        try:
            storage_path = upload_file_to_storage(file_bytes, file.filename)
            logger.info(f"File uploaded to storage: {storage_path}")
        except Exception as e:
            logger.warning(f"Storage upload failed (continuing without storage): {e}")
            storage_path = f"local/{file.filename}"  # Fallback path

        # Step 4: Load PDF and extract text from pages
        documents = await load_pdf_from_bytes(file_bytes, file.filename)
        page_count = len(documents)
        logger.info(f"PDF loaded. Pages: {page_count}")

        if not documents or page_count == 0:
            raise HTTPException(
                status_code=400, detail="No text could be extracted from the PDF"
            )

        # Step 5: Create document record in database
        doc_record = create_document_record(
            filename=file.filename,
            storage_path=storage_path,
            file_size=file_size,
            page_count=page_count,
            chunk_count=0,
        )
        document_id = doc_record["id"]
        logger.info(f"Document record created with ID: {document_id}")

        # Step 6: Chunk the documents using AI semantic chunking
        chunks = chunk_documents(documents)

        # Step 7: Create embeddings for all chunks
        chunks_with_embeddings = create_embeddings_for_chunks(chunks)

        # Step 8: Save chunks to database with document_id reference
        # Add document_id to each chunk's metadata
        for chunk in chunks_with_embeddings:
            chunk.metadata["document_id"] = document_id

        result = save_chunks_to_database(chunks_with_embeddings, document_id)
        chunk_count = result["chunks_saved"]

        # Step 9: Update document with chunk count
        update_document_chunk_count(document_id, chunk_count)

        # Return success response
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "document_id": document_id,
                "filename": file.filename,
                "storage_path": storage_path,
                "file_size": file_size,
                "pages_processed": page_count,
                "chunks_created": chunk_count,
                "message": f"Successfully processed '{file.filename}' into {chunk_count} semantic chunks",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing document: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error processing document: {str(e)}"
        )


@router.get("/list")
async def list_documents():
    """
    List all uploaded documents.

    Returns:
        List of documents with metadata (id, filename, size, pages, chunks, date)
    """
    try:
        documents = list_docs_service()

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "total_documents": len(documents),
                "documents": documents,
            },
        )

    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error listing documents: {str(e)}"
        )


@router.get("/{document_id}")
async def get_document(document_id: str):
    """
    Get details of a specific document.

    Args:
        document_id: UUID of the document

    Returns:
        Document metadata
    """
    try:
        doc = get_document_by_id(UUID(document_id))

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "document": doc,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting document: {str(e)}")


@router.get("/{document_id}/download")
async def download_document(document_id: str):
    """
    Download the original PDF file.

    Args:
        document_id: UUID of the document

    Returns:
        PDF file as binary response
    """
    try:
        doc = get_document_by_id(UUID(document_id))

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        storage_path = doc.get("storage_path")
        if not storage_path or storage_path.startswith("local/"):
            raise HTTPException(
                status_code=404, detail="Original file not available in storage"
            )

        file_bytes = get_file_from_storage(storage_path)

        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{doc["filename"]}"'
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading document: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error downloading document: {str(e)}"
        )


@router.get("/{document_id}/url")
async def get_document_url(document_id: str):
    """
    Get the public URL for a document (for PDF viewer).

    Args:
        document_id: UUID of the document

    Returns:
        Public URL string
    """
    try:
        doc = get_document_by_id(UUID(document_id))

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        storage_path = doc.get("storage_path")
        if not storage_path or storage_path.startswith("local/"):
            raise HTTPException(
                status_code=404, detail="Original file not available in storage"
            )

        url = get_file_public_url(storage_path)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "document_id": document_id,
                "filename": doc["filename"],
                "url": url,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document URL: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error getting document URL: {str(e)}"
        )


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document by ID (including all chunks and storage file).

    Args:
        document_id: UUID of the document

    Returns:
        Success message with deletion details
    """
    try:
        result = delete_doc_service(UUID(document_id))

        return JSONResponse(
            status_code=200,
            content=result,
        )

    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error deleting document: {str(e)}"
        )


@router.delete("/by-name/{filename}")
async def delete_document_by_name(filename: str):
    """
    Delete a document by filename (legacy endpoint for backward compatibility).

    Args:
        filename: The name of the file to delete

    Returns:
        Success message with deletion details
    """
    try:
        result = delete_document_by_filename(filename)

        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("message"))

        return JSONResponse(
            status_code=200,
            content=result,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error deleting document: {str(e)}"
        )
