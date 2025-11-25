"""
RAG Chain orchestration module.

This module implements the complete RAG (Retrieval-Augmented Generation)
pipeline that combines search, context formatting, and LLM generation.
"""

from typing import List, Dict, Any, Optional

from app.services.search import hybrid_search
from app.services.llm import get_llm_model
from app.services.prompts import get_system_prompt


def ask_question(
    question: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    top_k: int = 5,
) -> str:
    """
    Main RAG function - answers a question using retrieved context.

    This is the complete pipeline that:
    1. Searches for relevant chunks (hybrid search)
    2. Formats them into context
    3. Includes conversation history (if provided)
    4. Sends to LLM with system prompt
    5. Returns the answer

    Args:
        question: User's question in any language
        conversation_history: Optional list of previous messages
                             Format: [{"role": "user", "content": "..."},
                                     {"role": "assistant", "content": "..."}]
        top_k: Number of chunks to retrieve (default: 5)

    Returns:
        LLM's answer with citations

    Example:
        >>> # First question (no history)
        >>> answer = ask_question("What are the payment terms?")

        >>> # Follow-up question (with history)
        >>> history = [
        >>>     {"role": "user", "content": "What are the payment terms?"},
        >>>     {"role": "assistant", "content": "Payment is due in 30 days"}
        >>> ]
        >>> answer = ask_question("And what about late fees?", history)
    """

    # Step 1: Retrieve relevant chunks using hybrid search
    retrieved_chunks = hybrid_search(question, top_k=top_k)

    if not retrieved_chunks:
        return "I don't have any documents to search. " "Please upload documents first."

    # Step 2: Format chunks into context for the LLM
    context = _format_context(retrieved_chunks)

    # Step 3: Build the full prompt
    system_prompt = get_system_prompt()
    user_prompt = _build_user_prompt(question, context)

    # Step 4: Build messages with conversation history
    messages = [("system", system_prompt)]

    # Add conversation history if provided
    if conversation_history:
        for msg in conversation_history:
            role = msg.get("role")
            content = msg.get("content", "")

            if role == "user":
                messages.append(("human", content))
            elif role == "assistant":
                messages.append(("ai", content))

    # Add the current question
    messages.append(("human", user_prompt))

    # Step 5: Get LLM and generate answer
    llm = get_llm_model()
    response = llm.invoke(messages)

    # Extract text from response
    answer = response.content

    return answer


def _format_context(chunks: List[Dict[str, Any]]) -> str:
    """
    Formats retrieved chunks into a readable context string.

    Args:
        chunks: List of chunks from hybrid_search()

    Returns:
        Formatted context string with chunk numbering and metadata

    Example output:
        ---
        DOCUMENT 1:
        Source: contract.pdf (Page 3)
        Content: "Payment terms are 30 days net..."

        DOCUMENT 2:
        Source: invoice.pdf (Page 1)
        Content: "Total amount due: €5,280"
        ---
    """
    if not chunks:
        return "No relevant information found in documents."

    context_parts = []

    for idx, chunk in enumerate(chunks, start=1):
        # Extract metadata
        metadata = chunk.get("metadata", {})
        filename = metadata.get("source_filename", "Unknown")
        page_num = metadata.get("page_number", "Unknown")
        content = chunk.get("content", "")

        # Format each chunk
        chunk_text = f"""---
DOCUMENT {idx}:
Source: {filename} (Page {page_num})
Content: "{content}"
"""
        context_parts.append(chunk_text)

    return "\n".join(context_parts)


def _build_user_prompt(question: str, context: str) -> str:
    """
    Builds the user prompt combining question and context.

    Args:
        question: User's question
        context: Formatted context from documents

    Returns:
        Complete user prompt string
    """
    prompt = f"""Based on the following documents, please answer the question.

**DOCUMENTS:**
{context}

**QUESTION:**
{question}

**INSTRUCTIONS:**
- Answer ONLY using information from the documents above
- Always cite sources in format: [Source: filename.pdf, Page X]
- If the answer is not in the documents, say "I don't have information about this in the provided documents."
- Respond in the SAME language as the question
"""
    return prompt
