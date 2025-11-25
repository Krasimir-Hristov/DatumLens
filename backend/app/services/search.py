from app.db.supabase import get_supabase_client
from typing import List, Dict, Any


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
