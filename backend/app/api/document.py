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
import os

from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends
from fastapi.responses import JSONResponse, Response
from typing import Annotated
from app.api.deps import (
    CurrentUser,
    get_current_user_with_token,
    get_current_admin,
    CurrentAdmin,
)

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
    get_document_by_filename,
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
async def upload_document(
    user_with_token: CurrentAdmin,
    file: UploadFile = File(...),
):
    """
    Upload a PDF document, store it, and process it for RAG.
    Protected by Supabase Auth.
    """
    current_user, access_token = user_with_token

    # Step 1: Validate file type
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        user_id = current_user.id
        logger.info(f"Starting upload for file: {file.filename} by user: {user_id}")

        # Step 2: Read the uploaded file into memory
        file_bytes = await file.read()
        file_size = len(file_bytes)
        logger.info(f"File read successfully. Size: {file_size} bytes")

        # Step 2.5: Check for duplicate filename (TODO: Scope check by user_id in future)
        existing_doc = get_document_by_filename(file.filename)
        if existing_doc and existing_doc.get("user_id") == user_id:
            raise HTTPException(
                status_code=409,
                detail=f"Document '{file.filename}' already exists. Delete it first.",
            )

        # Step 3: Upload to Supabase Storage
        try:
            storage_path = upload_file_to_storage(file_bytes, file.filename, user_id)
            logger.info(f"File uploaded to storage: {storage_path}")
        except Exception as e:
            logger.warning(f"Storage upload failed (switching to local storage): {e}")
            # Ensure directory exists
            os.makedirs("uploaded_files", exist_ok=True)
            # Save file locally
            local_filename = f"{user_id}_{file.filename}"
            local_path = os.path.join("uploaded_files", local_filename)
            with open(local_path, "wb") as f:
                f.write(file_bytes)

            storage_path = f"local/{local_filename}"
            logger.info(f"File saved locally to: {local_path}")

        # Step 4: Load PDF and extract text from pages
        documents = await load_pdf_from_bytes(file_bytes, file.filename)
        page_count = len(documents)
        logger.info(f"PDF loaded. Pages: {page_count}")

        if not documents or page_count == 0:
            raise HTTPException(
                status_code=400, detail="No text could be extracted from the PDF"
            )

        # Step 5: Create document record in database
        logger.info(f"Step 5: Creating document record for {file.filename}")
        doc_record = create_document_record(
            filename=file.filename,
            storage_path=storage_path,
            file_size=file_size,
            page_count=page_count,
            chunk_count=0,
            user_id=UUID(user_id),
            access_token=access_token,
        )
        document_id = doc_record["id"]
        logger.info(
            f"Step 5: Completed. Document record created with ID: {document_id}"
        )

        # Step 6: Chunk the documents using AI semantic chunking
        logger.info(f"Step 6: Starting chunking for {file.filename}")
        chunks = chunk_documents(documents)
        logger.info(f"Step 6: Completed. Created {len(chunks)} chunks")

        # Step 7: Create embeddings for all chunks
        logger.info(
            f"Step 7: Creating embeddings for {len(chunks)} chunks (OpenAI call)"
        )
        chunks_with_embeddings = create_embeddings_for_chunks(chunks)
        logger.info("Step 7: Completed. Embeddings received.")

        # Step 8: Save chunks to database with document_id reference
        logger.info(f"Step 8: Saving {len(chunks_with_embeddings)} chunks to DB")
        for chunk in chunks_with_embeddings:
            chunk.metadata["document_id"] = document_id

        result = save_chunks_to_database(
            chunks_with_embeddings, document_id, access_token
        )
        chunk_count = result["chunks_saved"]
        logger.info(f"Step 8: Completed. Saved {chunk_count} chunks.")

        # Step 9: Update document with chunk count
        logger.info(f"Step 9: Updating chunk count for {document_id}")
        update_document_chunk_count(document_id, chunk_count, access_token)
        logger.info("Step 9: Completed.")

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
async def list_documents(
    user_with_token: CurrentAdmin,
):
    """
    List all uploaded documents for the authenticated user.
    Protected by Supabase Auth.
    """
    current_user, access_token = user_with_token

    try:
        user_id = UUID(current_user.id)
        documents = list_docs_service(user_id=user_id, access_token=access_token)

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
async def get_document(
    document_id: str,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Get details of a specific document.
    Protected: Users can only access their own documents.
    """
    current_user, access_token = user_with_token

    try:
        user_id = current_user.id
        doc = get_document_by_id(UUID(document_id), access_token)

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Check ownership
        if doc.get("user_id") != user_id:
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
async def download_document(
    document_id: str,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Download the original PDF file.
    Protected: Users can only download their own documents.
    """
    current_user, access_token = user_with_token

    try:
        user_id = current_user.id
        doc = get_document_by_id(UUID(document_id), access_token)

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Check ownership
        if doc.get("user_id") != user_id:
            raise HTTPException(status_code=404, detail="Document not found")

        storage_path = doc.get("storage_path")

        if not storage_path:
            raise HTTPException(
                status_code=404, detail="No storage path found for document"
            )

        # Handle local files
        if storage_path.startswith("local/"):
            filename = storage_path.replace("local/", "")
            local_path = os.path.join("uploaded_files", filename)

            if not os.path.exists(local_path):
                raise HTTPException(status_code=404, detail="Local file not found")

            with open(local_path, "rb") as f:
                file_bytes = f.read()
        else:
            # Handle Supabase storage files
            file_bytes = get_file_from_storage(storage_path)

        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{doc["filename"]}"'},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading document: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error downloading document: {str(e)}"
        )


@router.get("/{document_id}/url")
async def get_document_url(
    document_id: str,
    request: Request,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Get the public URL for a document (for PDF viewer).
    Protected: Users can only get URLs for their own documents.
    """
    current_user, access_token = user_with_token

    try:
        user_id = current_user.id
        doc = get_document_by_id(UUID(document_id), access_token)

        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Check ownership
        if doc.get("user_id") != user_id:
            raise HTTPException(status_code=404, detail="Document not found")

        storage_path = doc.get("storage_path")

        if not storage_path:
            raise HTTPException(status_code=404, detail="No storage path found")

        # If local file, return link to our own download endpoint
        if storage_path.startswith("local/"):
            # Construct URL to the download endpoint
            base_url = str(request.base_url).rstrip("/")
            url = f"{base_url}/documents/{document_id}/download"
        else:
            # If Supabase storage, get signed public URL
            try:
                url = get_file_public_url(storage_path)
            except Exception:
                # Fallback if we can't get public URL directly
                base_url = str(request.base_url).rstrip("/")
                url = f"{base_url}/documents/{document_id}/download"

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
async def delete_document(
    document_id: str,
    user_with_token: CurrentAdmin,
):
    """
    Delete a document and all its chunks.
    Protected: Users can only delete their own documents.
    """
    current_user, access_token = user_with_token

    try:
        user_id = current_user.id

        # Verify ownership before deletion
        doc = get_document_by_id(UUID(document_id), access_token)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        if doc.get("user_id") != user_id:
            raise HTTPException(status_code=404, detail="Document not found")

        result = delete_doc_service(UUID(document_id), access_token)

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
