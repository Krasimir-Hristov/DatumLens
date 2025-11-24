from typing import Optional, List
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from datetime import datetime

class RAGChunkMetadata(BaseModel):
    """
    Метаданни за конкретно парче текст (Chunk).
    Това ни помага да знаем откъде точно идва информацията,
    за да можем да я цитираме правилно.
    """
    source_filename: str = Field(..., description="Името на оригиналния PDF файл")
    page_number: int = Field(..., description="Номер на страницата (1-indexed)")
    # section_title е Optional, защото не винаги можем да засечем заглавие на секция
    section_title: Optional[str] = Field(None, description="Заглавието на секцията, ако е намерено")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Кога е създаден записът")

class RAGChunk(BaseModel):
    """
    Основният модел за RAG.
    Съдържа текста, метаданните и векторното представяне.
    """
    id: UUID = Field(default_factory=uuid4, description="Уникален идентификатор на парчето")
    content: str = Field(..., description="Самият текст на парчето")
    metadata: RAGChunkMetadata = Field(..., description="Метаданните, свързани с този текст")
    
    # Embedding-ът е списък от числа (float). 
    # OpenAI моделите обикновено връщат 1536 числа за един текст.
    # Това поле е Optional тук, защото може да създадем обекта преди да сме генерирали вектора.
    embedding: Optional[List[float]] = Field(None, description="Векторно представяне на текста (1536 dim)")
