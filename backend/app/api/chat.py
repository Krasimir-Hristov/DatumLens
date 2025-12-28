"""
Chat API endpoint for DatumLens RAG Assistant.

This module handles conversational interactions with the RAG system,
persisting conversation history in Supabase.
"""

import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Annotated

from app.services.rag_chain import ask_question
from app.api.deps import CurrentUser, get_current_user_with_token
from app.services.chat_service import (
    create_chat,
    list_chats,
    get_chat_history,
    add_message,
    delete_chat,
)

# Initialize router
router = APIRouter(prefix="/chat", tags=["chat"])

# Configuration
MAX_RETRIEVED_CHUNKS = int(os.getenv("MAX_RETRIEVED_CHUNKS", "5"))


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    question: str
    chat_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    chat_id: str
    answer: str
    sources_used: int
    conversation_length: int


@router.get("/list")
async def list_conversations(
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    List all conversations for the authenticated user.
    """
    current_user, access_token = user_with_token
    try:
        chats = list_chats(current_user.id, access_token)
        return {"success": True, "chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chat_id}/messages")
async def get_conversation_messages(
    chat_id: str,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Get message history for a specific chat.
    """
    _, access_token = user_with_token
    try:
        messages = get_chat_history(chat_id, access_token)
        return {"success": True, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chat_id}")
async def delete_conversation(
    chat_id: str,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Delete a conversation.
    """
    _, access_token = user_with_token
    try:
        delete_chat(chat_id, access_token)
        return {"success": True, "message": "Chat deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ask", response_model=ChatResponse)
async def chat_with_documents(
    request: ChatRequest,
    user_with_token: Annotated[tuple[dict, str], Depends(get_current_user_with_token)],
):
    """
    Main chat endpoint - answers questions with persistent conversation context.
    """
    current_user, access_token = user_with_token
    user_id = current_user.id

    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Step 1: Manage Chat Session
        chat_id = request.chat_id
        if not chat_id:
            # Create new chat if ID is not provided
            # Use first 50 chars of question as title
            title = (
                request.question[:50] + "..."
                if len(request.question) > 50
                else request.question
            )
            new_chat = create_chat(user_id, title, access_token)
            chat_id = new_chat["id"]

        # Step 2: Fetch Context (Previous messages)
        # We need to format them for the RAG chain (list of dicts)
        raw_history = get_chat_history(chat_id, access_token)
        conversation_history = [
            {"role": msg["role"], "content": msg["content"]} for msg in raw_history
        ]

        # Step 3: Get Answer from AI
        answer = ask_question(
            question=request.question,
            conversation_history=conversation_history,
            top_k=MAX_RETRIEVED_CHUNKS,
            access_token=access_token,
        )

        # Step 4: Persist the conversation
        # Save User Question
        add_message(chat_id, "user", request.question, access_token)
        # Save AI Answer
        add_message(chat_id, "assistant", answer, access_token)

        return ChatResponse(
            chat_id=chat_id,
            answer=answer,
            sources_used=MAX_RETRIEVED_CHUNKS,
            conversation_length=len(conversation_history) + 2,
        )

    except Exception as e:
        # If something goes wrong, try to return a meaningful error
        raise HTTPException(
            status_code=500, detail=f"Error processing question: {str(e)}"
        ) from e
