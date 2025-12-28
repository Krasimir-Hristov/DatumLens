"""
Chat Service for DatumLens RAG.

This module handles chat history persistence in Supabase:
- Creating chats
- storing messages
- Retrieving history
"""

import logging
from typing import List, Optional, Dict, Any
from uuid import UUID

from app.db.supabase import get_user_supabase_client, get_supabase_client

logger = logging.getLogger(__name__)


def create_chat(user_id: UUID, title: str, access_token: str) -> Dict[str, Any]:
    """
    Creates a new chat session.
    """
    supabase = get_user_supabase_client(access_token)

    data = {"user_id": str(user_id), "title": title}

    response = supabase.table("chats").insert(data).execute()

    if response.data:
        return response.data[0]
    raise Exception("Failed to create chat")


def list_chats(user_id: UUID, access_token: str) -> List[Dict[str, Any]]:
    """
    Lists all chats for a user.
    """
    supabase = get_user_supabase_client(access_token)

    # RLS handles the user_id filtering implicitly, but explicit is fine too
    response = (
        supabase.table("chats").select("*").order("created_at", desc=True).execute()
    )

    return response.data or []


def get_chat_history(chat_id: str, access_token: str) -> List[Dict[str, Any]]:
    """
    Retrieves messages for a specific chat.
    """
    supabase = get_user_supabase_client(access_token)

    response = (
        supabase.table("messages")
        .select("*")
        .eq("chat_id", chat_id)
        .order("created_at", desc=False)
        .execute()
    )

    return response.data or []


def add_message(
    chat_id: str, role: str, content: str, access_token: str
) -> Dict[str, Any]:
    """
    Adds a message to a chat.
    """
    supabase = get_user_supabase_client(access_token)

    data = {"chat_id": chat_id, "role": role, "content": content}

    response = supabase.table("messages").insert(data).execute()

    if response.data:
        return response.data[0]
    raise Exception("Failed to add message")


def delete_chat(chat_id: str, access_token: str) -> bool:
    """
    Deletes a chat and its messages (cascade).
    """
    supabase = get_user_supabase_client(access_token)

    response = supabase.table("chats").delete().eq("id", chat_id).execute()

    # Supabase user client might return data even on delete if RLS allows
    return True
