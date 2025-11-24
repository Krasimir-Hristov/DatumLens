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


def chunk_documents(documents: List[Document]) -> List[Document]:
    """
    Splits documents into semantically meaningful chunks using AI.
    
    Args:
        documents: List of LangChain Documents (usually pages from PDF)
    
    Returns:
        List of chunked Documents based on semantic similarity
    
    How AI Semantic Chunking works:
    1. Text is split into sentences.
    2. Each sentence is converted to a vector (embedding) using OpenAI's model.
    3. The AI compares consecutive sentences:
       - If vectors are similar → same topic, keep them together.
       - If vectors are different → topic changed, create a new chunk.
    4. Result: Chunks that respect semantic boundaries (topics, themes).
    
    Example:
    Instead of cutting mid-paragraph at 800 characters, it might split like:
    - Chunk 1: "Article 1: Definitions... Article 2: Payment terms..."
    - Chunk 2: "Article 3: Penalties... Article 4: Termination..."
    
    This is much smarter than counting characters!
    """
    
    from langchain_experimental.text_splitter import SemanticChunker
    from langchain_openai import OpenAIEmbeddings
    import os
    
    # Initialize OpenAI Embeddings
    # This reads OPENAI_API_KEY from your .env file
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small"  # Fast and cost-effective model
    )
    
    # Create the semantic chunker
    # breakpoint_threshold_type="percentile" means:
    # "Create a new chunk when the semantic difference is in the top 5% of all differences"
    text_splitter = SemanticChunker(
        embeddings=embeddings,
        breakpoint_threshold_type="percentile"  # Other options: "standard_deviation", "interquartile"
    )
    
    # Split all documents into semantic chunks
    # This is THE MAGIC - AI decides where to split!
    chunks = text_splitter.split_documents(documents)
    
    # Add chunk index to metadata (useful for debugging and ordering)
    for idx, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = idx
        chunk.metadata["chunking_method"] = "semantic_ai"  # Mark that this was AI-generated
    
    return chunks

