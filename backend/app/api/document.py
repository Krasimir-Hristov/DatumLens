from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.services.document_processor import (
    load_pdf_from_bytes,
    chunk_documents,
    create_embeddings_for_chunks,
)
from app.services.storage import save_chunks_to_database, delete_document_by_filename

# Create a router for document-related endpoints
# This keeps our code organized (all document routes in one place)
router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document, process it, and store it in the database.

    Steps:
    1. Validate the file (must be PDF)
    2. Read the file bytes
    3. Load PDF and extract pages
    4. Chunk the pages using AI semantic chunking
    5. Create embeddings for each chunk
    6. Save everything to the database

    Returns:
    - Success message with number of chunks created
    - Or error message if something went wrong
    """

    # Step 1: Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # Step 2: Read the uploaded file into memory
        file_bytes = await file.read()

        # Step 3: Load PDF and extract text from pages
        documents = await load_pdf_from_bytes(file_bytes, file.filename)

        if not documents or len(documents) == 0:
            raise HTTPException(
                status_code=400, detail="No text could be extracted from the PDF"
            )

        # Step 4: Chunk the documents using AI semantic chunking
        chunks = chunk_documents(documents)

        # Step 5: Create embeddings for all chunks
        chunks_with_embeddings = create_embeddings_for_chunks(chunks)

        # Step 6: Save to database
        result = save_chunks_to_database(chunks_with_embeddings)

        # Return success response
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "filename": file.filename,
                "pages_processed": len(documents),
                "chunks_created": result["chunks_saved"],
                "message": f"Successfully processed '{file.filename}' into {result['chunks_saved']} semantic chunks",
            },
        )

    except Exception as e:
        # If anything goes wrong, return a clear error
        raise HTTPException(
            status_code=500, detail=f"Error processing document: {str(e)}"
        )


@router.delete("/delete/{filename}")
async def delete_document(filename: str):
    """
    Delete all chunks associated with a specific document.
    This is for the "Delete & Replace" functionality.

    Args:
        filename: The name of the file to delete (e.g., "contract.pdf")

    Returns:
        Success message with number of chunks deleted
    """

    try:
        result = delete_document_by_filename(filename)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "filename": filename,
                "chunks_deleted": result["chunks_deleted"],
                "message": result["message"],
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting document: {str(e)}"
        )
