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

    embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
    query_embedding = embeddings_model.embed_query(query)

    response = supabase.rpc(
        "match_documents", {"query_embedding": query_embedding, "match_count": limit}
    ).execute()

    return response.data


def hybrid_search(
    query: str, keyword_weight: float = 0.3, vector_weight: float = 0.7, top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Performs a Hybrid Search combining keyword and vector search.

    This is the production search function that should be used for all queries.
    It leverages the strengths of both search methods:
    - Keyword search: exact matches, proper nouns, IDs
    - Vector search: semantic understanding, synonyms, multi-language

    Args:
        query: The user's search query
        keyword_weight: Weight for keyword search results (0.0-1.0, default: 0.3)
        vector_weight: Weight for vector search results (0.0-1.0, default: 0.7)
        top_k: Number of final results to return (default: 5)

    Returns:
        List of chunks ranked by hybrid score

    Raises:
        ValueError: If weights don't sum to 1.0
        Exception: If both search methods fail

    Example:
        >>> results = hybrid_search("What are the penalties?")
        >>> print(results[0]['content'])
        'Article 5: Penalties for late payment...'
    """
    if not abs((keyword_weight + vector_weight) - 1.0) < 0.01:
        raise ValueError(
            f"Weights must sum to 1.0, got {keyword_weight + vector_weight}"
        )

    try:
        fetch_count = top_k * 2

        keyword_results = search_by_keyword(query, limit=fetch_count)
        vector_results = search_by_vector(query, limit=fetch_count)

        combined_results = _merge_search_results(
            keyword_results=keyword_results,
            vector_results=vector_results,
            keyword_weight=keyword_weight,
            vector_weight=vector_weight,
        )

        return combined_results[:top_k]

    except Exception as e:
        raise Exception(f"Hybrid search failed: {str(e)}") from e


def _merge_search_results(
    keyword_results: List[Dict[str, Any]],
    vector_results: List[Dict[str, Any]],
    keyword_weight: float,
    vector_weight: float,
) -> List[Dict[str, Any]]:
    """
    Merges and scores results from keyword and vector search.

    This is a private helper function (hence the _ prefix).

    Scoring strategy:
    - Keyword results: score = (1 / rank) * keyword_weight
    - Vector results: score = similarity * vector_weight
    - Deduplication: keep highest score for each unique chunk ID

    Args:
        keyword_results: Results from FTS
        vector_results: Results from vector search
        keyword_weight: Weight for keyword scores
        vector_weight: Weight for vector scores

    Returns:
        Merged and sorted list of chunks
    """
    scored_chunks = {}

    for rank, result in enumerate(keyword_results, start=1):
        chunk_id = result["id"]
        score = (1.0 / rank) * keyword_weight

        if chunk_id not in scored_chunks:
            scored_chunks[chunk_id] = {
                **result,
                "hybrid_score": score,
                "sources": ["keyword"],
            }
        else:
            scored_chunks[chunk_id]["hybrid_score"] += score
            scored_chunks[chunk_id]["sources"].append("keyword")

    for result in vector_results:
        chunk_id = result["id"]
        similarity = result.get("similarity", 0.0)
        score = similarity * vector_weight

        if chunk_id not in scored_chunks:
            scored_chunks[chunk_id] = {
                **result,
                "hybrid_score": score,
                "sources": ["vector"],
            }
        else:
            scored_chunks[chunk_id]["hybrid_score"] += score
            scored_chunks[chunk_id]["sources"].append("vector")

    merged = sorted(
        scored_chunks.values(), key=lambda x: x["hybrid_score"], reverse=True
    )

    return merged
