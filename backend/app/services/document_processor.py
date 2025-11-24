from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document
from typing import List
import tempfile
import os

async def load_pdf_from_bytes(file_bytes: bytes, filename: str) -> List[Document]:
    """
    Loads a PDF file from bytes and converts it to LangChain Documents.
    
    Args:
        file_bytes: The PDF file content as bytes
        filename: The original filename (for metadata)
    
    Returns:
        List of LangChain Document objects, one per page
    
    How it works:
    1. Creates a temporary file on disk (PyPDFLoader needs a file path)
    2. Writes the bytes to that file
    3. Uses PyPDFLoader to read and extract text from each page
    4. Adds metadata (filename, page number) to each page
    5. Cleans up the temporary file
    """
    
    # Create a temporary file to store the PDF
    # We need this because PyPDFLoader expects a file path, not bytes
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(file_bytes)
        tmp_path = tmp_file.name
    
    try:
        # Load the PDF using LangChain's PyPDFLoader
        loader = PyPDFLoader(tmp_path)
        
        # This extracts text from all pages
        # Each page becomes a separate Document object
        documents = loader.load()
        
        # Add the source filename to metadata for each page
        for doc in documents:
            doc.metadata["source_filename"] = filename
            # page number is already added by PyPDFLoader as 'page'
            # but we'll rename it to match our schema
            if "page" in doc.metadata:
                doc.metadata["page_number"] = doc.metadata["page"] + 1  # 1-indexed
        
        return documents
    
    finally:
        # Always clean up the temporary file, even if an error occurred
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
