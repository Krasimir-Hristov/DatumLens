"""
Chat API endpoint for DatumLens RAG Assistant.

This module handles conversational interactions with the RAG system,
maintaining in-memory conversation history for context.
"""

import os
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.rag_chain import ask_question

# Initialize router
router = APIRouter(prefix="/chat", tags=["chat"])

# Configuration from environment variables
# This allows business to control costs by limiting tokens
MAX_CONVERSATION_HISTORY = int(os.getenv("MAX_CONVERSATION_HISTORY", "5"))
MAX_RETRIEVED_CHUNKS = int(os.getenv("MAX_RETRIEVED_CHUNKS", "5"))

# In-memory storage for active conversations
# Format: {user_id: [{"role": "user", "content": "..."}, ...]}
# In production (Phase 5.8), this will be replaced with Redis
active_conversations: Dict[str, List[Dict[str, str]]] = {}


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    question: str
    user_id: str = "default_user"  # Will be from auth in Phase 5


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    answer: str
    sources_used: int
    conversation_length: int


@router.post("/ask", response_model=ChatResponse)
async def chat_with_documents(request: ChatRequest):
    """
    Main chat endpoint - answers questions with conversation context.

    This endpoint:
    1. Retrieves conversation history for the user
    2. Limits history to MAX_CONVERSATION_HISTORY (cost optimization)
    3. Calls RAG chain with history
    4. Saves the new messages to history
    5. Returns the answer

    Args:
        request: ChatRequest with question and user_id

    Returns:
        ChatResponse with answer and metadata

    Raises:
        HTTPException: If question is empty or error occurs

    Example:
        POST /chat/ask
        {
            "question": "What are the payment terms?",
            "user_id": "user_123"
        }

        Response:
        {
            "answer": "Payment terms are 30 days [Source: contract.pdf, Page 3]",
            "sources_used": 5,
            "conversation_length": 2
        }
    """
    # Validation
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Get or create conversation history for this user
        user_id = request.user_id
        if user_id not in active_conversations:
            active_conversations[user_id] = []

        history = active_conversations[user_id]

        # Trim history to last N exchanges (cost optimization)
        # Each exchange = 1 user message + 1 assistant message = 2 items
        max_messages = MAX_CONVERSATION_HISTORY * 2
        if len(history) > max_messages:
            history = history[-max_messages:]
            active_conversations[user_id] = history

        # Call RAG chain with conversation history
        answer = ask_question(
            question=request.question,
            conversation_history=history,
            top_k=MAX_RETRIEVED_CHUNKS,
        )

        # Update conversation history
        history.append({"role": "user", "content": request.question})
        history.append({"role": "assistant", "content": answer})
        active_conversations[user_id] = history

        return ChatResponse(
            answer=answer,
            sources_used=MAX_RETRIEVED_CHUNKS,
            conversation_length=len(history) // 2,  # Number of exchanges
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing question: {str(e)}"
        ) from e


@router.delete("/clear/{user_id}")
async def clear_conversation(user_id: str):
    """
    Clears conversation history for a user.

    Useful for:
    - Starting a fresh conversation
    - Freeing up memory
    - User privacy

    Args:
        user_id: ID of the user whose history to clear

    Returns:
        Success message
    """
    if user_id in active_conversations:
        del active_conversations[user_id]
        return {"message": f"Conversation cleared for user {user_id}"}

    return {"message": f"No conversation found for user {user_id}"}


@router.get("/stats")
async def get_stats():
    """
    Returns statistics about active conversations.

    Useful for monitoring memory usage and active users.

    Returns:
        Statistics about conversations
    """
    total_conversations = len(active_conversations)
    total_messages = sum(len(history) for history in active_conversations.values())

    return {
        "active_conversations": total_conversations,
        "total_messages": total_messages,
        "max_history_setting": MAX_CONVERSATION_HISTORY,
        "max_chunks_setting": MAX_RETRIEVED_CHUNKS,
    }
