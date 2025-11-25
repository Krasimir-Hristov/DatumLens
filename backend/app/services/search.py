from typing import List, Dict, Any
from langchain_openai import OpenAIEmbeddings
from app.db.supabase import get_supabase_client


def search_by_keyword(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Performs a Full-Text Search (Keyword Search) on document chunks.

    Args:
        query: The search keywords (e.g. "неустойки")
        limit: Max number of results to return

    Returns:
        List of matching chunks with their metadata

    How it works:
    Uses PostgreSQL's built-in Full-Text Search with the 'simple' configuration.
    This matches exact words regardless of language.
    """
    supabase = get_supabase_client()

    # We use .text_search() which maps to the SQL:
    # WHERE to_tsvector('simple', content) @@ websearch_to_tsquery('simple', query)

    response = (
        supabase.table("document_chunks")
        .select("id, content, metadata, created_at")
        .text_search("content", query, config="simple")
        .limit(limit)
        .execute()
    )

    return response.data


def search_by_vector(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Performs a Vector Similarity Search on document chunks.

    Args:
        query: The user's question (e.g. "What are the penalties?")
        limit: Max number of results to return

    Returns:
        List of matching chunks sorted by semantic similarity

    How it works:
    1. Convert the query to an embedding vector using OpenAI
    2. Call the match_documents() SQL function we created
    3. PostgreSQL finds the closest vectors using cosine similarity
    4. Returns the most semantically similar chunks
    """
    supabase = get_supabase_client()

    # Step 1: Convert query to embedding
    embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
    query_embedding = embeddings_model.embed_query(query)

    # Step 2: Call our custom SQL function
    # This uses the <=> operator we saw in the SQL function
    response = supabase.rpc(
        "match_documents", {"query_embedding": query_embedding, "match_count": limit}
    ).execute()

    return response.data
