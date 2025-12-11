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


from typing import Annotated
from fastapi import Depends
from app.api.deps import CurrentUser, get_current_user_with_token


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    question: str


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    answer: str
    sources_used: int
    conversation_length: int


@router.post("/ask", response_model=ChatResponse)
async def chat_with_documents(
    request: ChatRequest,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Main chat endpoint - answers questions with conversation context.
    Protected by Supabase Auth (JWT).
    """
    current_user, access_token = user_with_token

    # Validation
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Get user ID from authenticated token
        user_id = current_user.id

        if user_id not in active_conversations:
            active_conversations[user_id] = []

        history = active_conversations[user_id]

        # Trim history to last N exchanges (cost optimization)
        max_messages = MAX_CONVERSATION_HISTORY * 2
        if len(history) > max_messages:
            history = history[-max_messages:]
            active_conversations[user_id] = history

        # Call RAG chain with conversation history
        answer = ask_question(
            question=request.question,
            conversation_history=history,
            top_k=MAX_RETRIEVED_CHUNKS,
            access_token=access_token,
        )

        # Update conversation history
        history.append({"role": "user", "content": request.question})
        history.append({"role": "assistant", "content": answer})
        active_conversations[user_id] = history

        return ChatResponse(
            answer=answer,
            sources_used=MAX_RETRIEVED_CHUNKS,
            conversation_length=len(history) // 2,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing question: {str(e)}"
        ) from e


@router.delete("/clear")
async def clear_conversation(current_user: CurrentUser):
    """
    Clears conversation history for the authenticated user.
    """
    user_id = current_user.id

    if user_id in active_conversations:
        del active_conversations[user_id]
        return {"message": "Conversation history cleared"}

    return {"message": "No conversation found"}


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
