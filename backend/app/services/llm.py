import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models.chat_models import BaseChatModel

# Default constants (fallbacks)
DEFAULT_MODEL_NAME = "gemini-2.5-flash-lite"
DEFAULT_TEMPERATURE = 0.1
DEFAULT_TOP_P = 0.9


def get_llm_model(
    temperature: Optional[float] = None,
    top_p: Optional[float] = None,
    model_name: Optional[str] = None,
) -> BaseChatModel:
    """
    Initializes and returns the Google Gemini Chat model.

    Configuration Precedence (Priority):
    1. Function arguments (if provided)
    2. Environment variables (.env)
    3. Default constants (hardcoded fallbacks)

    Args:
        temperature: Controls randomness (0.0 = deterministic, 1.0 = creative).
        top_p: Nucleus sampling parameter.
        model_name: The specific Gemini model version.

    Returns:
        Configured LangChain ChatModel instance.

    Raises:
        ValueError: If GOOGLE_API_KEY is missing.
    """
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY is missing in .env file. "
            "Please get one from https://aistudio.google.com/"
        )

    # Resolve configuration values
    # Logic: Use argument if present, else use env var, else use default

    final_model_name = model_name or os.getenv("LLM_MODEL_NAME", DEFAULT_MODEL_NAME)

    # For floats, we need to parse the env string safely
    env_temp = os.getenv("LLM_TEMPERATURE")
    final_temperature = (
        temperature
        if temperature is not None
        else (float(env_temp) if env_temp else DEFAULT_TEMPERATURE)
    )

    env_top_p = os.getenv("LLM_TOP_P")
    final_top_p = (
        top_p
        if top_p is not None
        else (float(env_top_p) if env_top_p else DEFAULT_TOP_P)
    )

    # Initialize Gemini
    llm = ChatGoogleGenerativeAI(
        model=final_model_name,
        temperature=final_temperature,
        top_p=final_top_p,
        google_api_key=api_key,
        max_retries=2,
        convert_system_message_to_human=True,  # Fix for some Gemini versions
    )

    return llm
