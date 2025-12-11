"""
Shared dependencies for API routes (Authentication, etc.)
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import Client
from app.db.supabase import get_supabase_client

# Define the OAuth2 scheme
# This tells FastAPI that the token is expected in the Authorization header as "Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    supabase: Client = Depends(get_supabase_client),
) -> dict:
    """
    Validates the JWT token with Supabase and returns the user object.

    If validation fails, raises 401 Unauthorized.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Verify token via Supabase Auth API
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_response.user

    except Exception as e:
        print(f"Auth Error: {e}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_with_token(
    token: Annotated[str, Depends(oauth2_scheme)],
    supabase: Client = Depends(get_supabase_client),
) -> tuple[dict, str]:
    """
    Validates JWT token and returns both user object and the token itself.
    Useful when we need to create user-specific Supabase client.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return (user_response.user, token)

    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Type alias for easy use in routes
CurrentUser = Annotated[dict, Depends(get_current_user)]
CurrentUserWithToken = Annotated[tuple[dict, str], Depends(get_current_user_with_token)]
