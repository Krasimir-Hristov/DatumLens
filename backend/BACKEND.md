# 📚 DatumLens RAG Backend - Complete Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-11-26  
**Status:** Production-Ready (Phases 1-3 Complete)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Services Layer](#services-layer)
6. [Configuration](#configuration)
7. [Development](#development)
8. [For Frontend Developers](#for-frontend-developers)

---

## 🎯 Project Overview

DatumLens is an **intelligent document analysis system** using **RAG (Retrieval-Augmented Generation)**. It allows users to:

1. **Upload** PDF documents
2. **Ask questions** in natural language
3. **Receive answers** with precise citations from the documents
4. **Have conversations** with context memory

### Tech Stack

- **Framework:** FastAPI 0.104+
- **Database:** Supabase (PostgreSQL + pgvector)
- **AI/ML:**
  - OpenAI (text-embedding-3-small for embeddings)
  - Google Gemini (gemini-pro for LLM)
  - LangChain (orchestration)
- **Search:** Hybrid (Full-Text Search + Vector Similarity)

---

## 🏗️ Architecture

### High-Level Flow

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                  │
│  ┌────────────┐      ┌────────────┐     │
│  │ API Layer  │──────▶│  Services  │     │
│  │(Endpoints) │      │   Layer    │     │
│  └────────────┘      └──────┬─────┘     │
│                             │           │
└─────────────────────────────┼───────────┘
                              ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    │  (PostgreSQL)    │
                    │   + pgvector     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │  - OpenAI        │
                    │  - Google Gemini │
                    └──────────────────┘
```

### Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── api/                    # API endpoints (routers)
│   │   ├── document.py         # Document upload/delete/list
│   │   └── chat.py             # Chat/conversation endpoints
│   ├── services/               # Business logic layer
│   │   ├── document_processor.py  # PDF processing & chunking
│   │   ├── storage.py          # Database operations
│   │   ├── search.py           # Hybrid search
│   │   ├── rag_chain.py        # RAG orchestration
│   │   ├── llm.py              # LLM initialization
│   │   └── prompts.py          # System prompts
│   ├── db/
│   │   └── supabase.py         # Supabase client
│   └── models/
│       └── rag_model.py        # Pydantic models
├── .env                        # Environment variables
├── pyproject.toml              # Dependencies
└── BACKEND.md                  # This file
```

---

## 🗄️ Database Schema

### Table: `document_chunks`

Stores processed document chunks with their embeddings for RAG.

```sql
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  content TEXT NOT NULL,                    -- The actual text of the chunk
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Source info, page numbers, etc.
  embedding extensions.vector(1536),        -- OpenAI embedding vector
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Indexes

```sql
-- Vector similarity search (HNSW for fast approximate nearest neighbor)
CREATE INDEX document_chunks_embedding_idx
ON public.document_chunks
USING hnsw (embedding extensions.vector_cosine_ops);

-- Full-text search (GIN index for keyword search)
CREATE INDEX document_chunks_content_fts_idx
ON public.document_chunks
USING gin (to_tsvector('simple'::regconfig, content));
```

### SQL Functions

#### `match_documents` - Vector Similarity Search

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  FROM document_chunks
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Metadata Structure

Each chunk's `metadata` JSONB field contains:

```json
{
  "source_filename": "contract.pdf", // Original PDF filename
  "page": 0, // 0-indexed page (from PyPDF)
  "page_number": 1, // 1-indexed page (user-friendly)
  "total_pages": 10, // Total pages in PDF
  "chunk_index": 0, // Index of this chunk
  "chunking_method": "semantic_ai", // How it was chunked
  "source": "C:\\Users\\...\\temp.pdf", // Temp file path (legacy)
  "creator": "PyPDF", // PDF creator
  "producer": "...", // PDF producer
  "creationdate": "D:20250701101459" // PDF creation date
}
```

### Row Level Security (RLS)

**Current Status:** `DISABLED` (Development Mode)

For production (Phase 5.4), enable RLS:

```sql
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY "Users can view own documents" ON document_chunks
FOR SELECT
USING (auth.uid() = (metadata->>'user_id')::uuid);

-- Policy: Users can delete only their own documents
CREATE POLICY "Users can delete own documents" ON document_chunks
FOR DELETE
USING (auth.uid() = (metadata->>'user_id')::uuid);

-- Policy: Users can insert only with their user_id
CREATE POLICY "Users can insert own documents" ON document_chunks
FOR INSERT
WITH CHECK (auth.uid() = (metadata->>'user_id')::uuid);
```

---

## 🛣️ API Endpoints

### Base URL

```
http://127.0.0.1:8000
```

### Swagger UI

```
http://127.0.0.1:8000/docs
```

---

### 1. Health Check

**GET** `/health`

Verifies API and database connectivity.

**Response:**

```json
{
  "status": "ok",
  "message": "DatumLens API & DB are running 🚀",
  "db_connection": "active"
}
```

---

### 2. Document Upload

**POST** `/documents/upload`

Uploads a PDF, processes it, and stores chunks in the database.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: PDF file (required)

**Process Flow:**

1. Validates file is PDF
2. Extracts text from all pages using `PyPDFLoader`
3. Chunks text using **AI Semantic Chunking** (`SemanticChunker`)
4. Creates embeddings for each chunk (`OpenAIEmbeddings`)
5. Stores chunks + embeddings in Supabase

**Response (Success - 200):**

```json
{
  "success": true,
  "filename": "contract.pdf",
  "pages_processed": 10,
  "chunks_created": 25,
  "message": "Successfully processed 'contract.pdf' into 25 semantic chunks"
}
```

**Response (Error - 400):**

```json
{
  "detail": "Only PDF files are supported"
}
```

or

```json
{
  "detail": "No text could be extracted from the PDF"
}
```

**Response (Error - 500):**

```json
{
  "detail": "Error processing document: <error message>"
}
```

**Frontend Example:**

```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://127.0.0.1:8000/documents/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(`Uploaded! Created ${result.chunks_created} chunks`);
```

---

### 3. Document Delete

**DELETE** `/documents/delete/{filename}`

Deletes all chunks associated with a specific document.

**Path Parameters:**

- `filename`: Name of the file to delete (e.g., `contract.pdf`)

**Process Flow:**

1. Fetches all chunks from database
2. Filters chunks where `metadata.source_filename` matches
3. Deletes each matching chunk by ID

**Response (Success - 200):**

```json
{
  "success": true,
  "filename": "contract.pdf",
  "chunks_deleted": 25,
  "message": "Deleted 25 chunks for document: contract.pdf"
}
```

**Response (Error - 500):**

```json
{
  "detail": "Error deleting document: <error message>"
}
```

**Frontend Example:**

```javascript
const response = await fetch(
  'http://127.0.0.1:8000/documents/delete/contract.pdf',
  {
    method: 'DELETE',
  }
);

const result = await response.json();
console.log(`Deleted ${result.chunks_deleted} chunks`);
```

---

### 4. List Documents

**GET** `/documents/list`

Lists all document chunks in the database (debug/admin endpoint).

**Response (Success - 200):**

```json
{
  "total_chunks": 50,
  "chunks": [
    {
      "id": "c421d308-38c4-4ac1-bffb-9252e977583c",
      "metadata": {
        "source_filename": "contract.pdf",
        "page_number": 1,
        "chunk_index": 0,
        ...
      }
    },
    ...
  ]
}
```

**Frontend Example:**

```javascript
const response = await fetch('http://127.0.0.1:8000/documents/list');
const result = await response.json();
console.log(`Total chunks: ${result.total_chunks}`);
```

---

### 5. Chat (Ask Question)

**POST** `/chat/ask`

Main chat endpoint - answers questions using RAG with conversation context.

**Request Body:**

```json
{
  "question": "What are the payment terms?",
  "user_id": "default_user"
}
```

**Request Model:**

```typescript
interface ChatRequest {
  question: string;
  user_id?: string; // Optional, defaults to "default_user"
}
```

**Process Flow:**

1. Retrieves conversation history for user (from in-memory store)
2. Limits history to `MAX_CONVERSATION_HISTORY` (default: 5 exchanges)
3. Performs **hybrid search** to find relevant chunks
4. Formats chunks into context
5. Builds prompt with system instructions + history + question + context
6. Calls LLM (Gemini) to generate answer
7. Saves question + answer to history
8. Returns answer with metadata

**Response (Success - 200):**

```json
{
  "answer": "Payment terms are Net 30 days from invoice date. [Source: contract.pdf, Page 3]",
  "sources_used": 5,
  "conversation_length": 2
}
```

**Response Model:**

```typescript
interface ChatResponse {
  answer: string; // LLM's answer with citations
  sources_used: number; // Number of chunks used (always MAX_RETRIEVED_CHUNKS)
  conversation_length: number; // Number of exchanges in history
}
```

**Response (Error - 400):**

```json
{
  "detail": "Question cannot be empty"
}
```

**Response (Error - 500):**

```json
{
  "detail": "Error processing question: <error message>"
}
```

**Frontend Example:**

```javascript
const response = await fetch('http://127.0.0.1:8000/chat/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'What are the payment terms?',
    user_id: 'user_123',
  }),
});

const result = await response.json();
console.log(result.answer);
```

**Important Notes:**

- Conversation history is **in-memory** (resets on server restart)
- In Phase 5.8, will be upgraded to **Redis** with TTL
- History is **per user_id** (isolated conversations)
- Maximum history is configurable via `MAX_CONVERSATION_HISTORY` in `.env`

---

### 6. Clear Conversation

**DELETE** `/chat/clear/{user_id}`

Clears conversation history for a specific user.

**Path Parameters:**

- `user_id`: ID of the user whose history to clear

**Response (Success - 200):**

```json
{
  "message": "Conversation cleared for user user_123"
}
```

or (if no conversation exists):

```json
{
  "message": "No conversation found for user user_123"
}
```

**Frontend Example:**

```javascript
const response = await fetch('http://127.0.0.1:8000/chat/clear/user_123', {
  method: 'DELETE',
});

const result = await response.json();
console.log(result.message);
```

---

### 7. Chat Statistics

**GET** `/chat/stats`

Returns statistics about active conversations (monitoring endpoint).

**Response (Success - 200):**

```json
{
  "active_conversations": 5,
  "total_messages": 120,
  "max_history_setting": 5,
  "max_chunks_setting": 5
}
```

**Frontend Example:**

```javascript
const response = await fetch('http://127.0.0.1:8000/chat/stats');
const result = await response.json();
console.log(`Active conversations: ${result.active_conversations}`);
```

---

## ⚙️ Services Layer

### 1. `document_processor.py` - PDF Processing

#### `load_pdf_from_bytes(file_bytes, filename)`

Loads a PDF from bytes and converts to LangChain Documents.

**Process:**

1. Creates temporary file (PyPDFLoader needs file path)
2. Writes bytes to temp file
3. Uses `PyPDFLoader` to extract text
4. Adds metadata (`source_filename`, `page_number`)
5. Cleans up temp file

**Parameters:**

- `file_bytes` (bytes): PDF content
- `filename` (str): Original filename

**Returns:**

- `List[Document]`: One Document per page

**Example:**

```python
from app.services.document_processor import load_pdf_from_bytes

pdf_bytes = await file.read()
documents = await load_pdf_from_bytes(pdf_bytes, "contract.pdf")
print(f"Loaded {len(documents)} pages")
```

---

#### `chunk_documents(documents)`

Splits documents into semantically meaningful chunks using AI.

**How it works:**

1. Initializes `OpenAIEmbeddings`
2. Creates `SemanticChunker` (uses AI to detect topic changes)
3. Chunker:
   - Splits text into sentences
   - Creates embeddings for each sentence
   - Groups similar sentences together (same topic)
   - Creates new chunk when topic changes
4. Adds metadata (`chunk_index`, `chunking_method`)

**Parameters:**

- `documents` (List[Document]): Pages from PDF

**Returns:**

- `List[Document]`: Semantic chunks

**Example:**

```python
from app.services.document_processor import chunk_documents

chunks = chunk_documents(documents)
print(f"Created {len(chunks)} semantic chunks")
```

**Why Semantic Chunking?**

- Better than character/token splitting
- Respects semantic boundaries (topics, themes)
- Improves RAG accuracy

---

#### `create_embeddings_for_chunks(chunks)`

Creates embedding vectors for each chunk.

**Process:**

1. Initializes `OpenAIEmbeddings` (text-embedding-3-small)
2. For each chunk:
   - Calls OpenAI API with chunk text
   - Gets 1536-dimensional vector
   - Stores in `chunk.metadata["embedding"]`

**Parameters:**

- `chunks` (List[Document]): Semantic chunks

**Returns:**

- `List[Document]`: Same chunks with embeddings in metadata

**Example:**

```python
from app.services.document_processor import create_embeddings_for_chunks

chunks_with_embeddings = create_embeddings_for_chunks(chunks)
```

---

### 2. `storage.py` - Database Operations

#### `save_chunks_to_database(chunks)`

Saves processed chunks with embeddings to Supabase.

**Process:**

1. For each chunk:
   - Extracts embedding from metadata
   - Removes embedding from metadata (store in separate column)
   - Creates record: `{content, metadata, embedding}`
2. Batch inserts all records

**Parameters:**

- `chunks` (List[Document]): Chunks with embeddings

**Returns:**

- `dict`: `{success, chunks_saved, message}`

**Example:**

```python
from app.services.storage import save_chunks_to_database

result = save_chunks_to_database(chunks_with_embeddings)
print(result["message"])
```

---

#### `delete_document_by_filename(filename)`

Deletes all chunks for a specific document.

**Process:**

1. Fetches all chunks with `SELECT id, metadata`
2. Filters in Python where `metadata.source_filename == filename`
3. Deletes each matching chunk by ID

**Why not SQL filter?**

- Supabase Python client has issues with JSONB filtering in DELETE
- Python filtering is 100% reliable

**Parameters:**

- `filename` (str): Source filename to delete

**Returns:**

- `dict`: `{success, chunks_deleted, message}`

**Example:**

```python
from app.services.storage import delete_document_by_filename

result = delete_document_by_filename("contract.pdf")
print(f"Deleted {result['chunks_deleted']} chunks")
```

---

### 3. `search.py` - Hybrid Search

#### `search_by_keyword(query, limit)`

Full-Text Search using PostgreSQL FTS.

**Process:**

1. Uses Supabase `.text_search()` with `type="websearch"`
2. PostgreSQL searches `content` field using GIN index
3. Returns top N matches

**Parameters:**

- `query` (str): Search keywords
- `limit` (int): Max results (default: 5)

**Returns:**

- `List[dict]`: Matching chunks

**Example:**

```python
from app.services.search import search_by_keyword

results = search_by_keyword("payment terms", limit=5)
```

---

#### `search_by_vector(query, limit)`

Vector Similarity Search using embeddings.

**Process:**

1. Converts query to embedding vector
2. Calls SQL function `match_documents(query_embedding, limit)`
3. PostgreSQL finds closest vectors using cosine similarity
4. Returns top N matches sorted by similarity

**Parameters:**

- `query` (str): User's question
- `limit` (int): Max results (default: 5)

**Returns:**

- `List[dict]`: Matching chunks with `similarity` score

**Example:**

```python
from app.services.search import search_by_vector

results = search_by_vector("What are the penalties?", limit=5)
```

---

#### `hybrid_search(query, keyword_weight, vector_weight, top_k)`

**MAIN SEARCH FUNCTION** - Combines keyword + vector search.

**Process:**

1. Performs both searches with `top_k * 2` results each
2. Scores results:
   - Keyword: `score = (1 / rank) * keyword_weight`
   - Vector: `score = similarity * vector_weight`
3. Merges and deduplicates (same chunk from both searches)
4. Sorts by combined score
5. Returns top K

**Parameters:**

- `query` (str): Search query
- `keyword_weight` (float): Weight for keyword (default: 0.3)
- `vector_weight` (float): Weight for vector (default: 0.7)
- `top_k` (int): Final number of results (default: 5)

**Returns:**

- `List[dict]`: Top K chunks ranked by hybrid score

**Example:**

```python
from app.services.search import hybrid_search

results = hybrid_search("What are the payment terms?", top_k=5)
```

**Why Hybrid?**

- **Keyword search**: Good for exact matches, proper nouns, IDs
- **Vector search**: Good for semantic understanding, synonyms, paraphrasing
- **Hybrid**: Best of both worlds

---

### 4. `rag_chain.py` - RAG Orchestration

#### `ask_question(question, conversation_history, top_k)`

**MAIN RAG FUNCTION** - Complete pipeline from question to answer.

**Process:**

1. **Retrieve:** Calls `hybrid_search()` to get relevant chunks
2. **Format Context:** Formats chunks with source citations
3. **Build Prompt:** Combines system prompt + history + question + context
4. **Generate:** Calls LLM (Gemini) to generate answer
5. **Return:** Returns answer with citations

**Parameters:**

- `question` (str): User's question
- `conversation_history` (List[dict]): Previous messages (optional)
- `top_k` (int): Number of chunks to retrieve (default: 5)

**Returns:**

- `str`: LLM's answer with citations

**Example:**

```python
from app.services.rag_chain import ask_question

# First question (no history)
answer = ask_question("What are the payment terms?")

# Follow-up question (with history)
history = [
    {"role": "user", "content": "What are the payment terms?"},
    {"role": "assistant", "content": "Payment is due in 30 days"}
]
answer = ask_question("And what about late fees?", history)
```

---

#### `_format_context(chunks)`

Private function - Formats chunks into readable context.

**Output Format:**

```
---
DOCUMENT 1:
Source: contract.pdf (Page 3)
Content: "Payment terms are 30 days net..."

DOCUMENT 2:
Source: invoice.pdf (Page 1)
Content: "Total amount due: €5,280"
---
```

---

#### `_build_user_prompt(question, context)`

Private function - Builds the user prompt.

**Template:**

```
Based on the following documents, please answer the question.

**DOCUMENTS:**
<context>

**QUESTION:**
<question>

**INSTRUCTIONS:**
- Answer ONLY using information from the documents above
- Always cite sources in format: [Source: filename.pdf, Page X]
- If the answer is not in the documents, say "I don't have information about this in the provided documents."
- Respond in the SAME language as the question
```

---

### 5. `llm.py` - LLM Initialization

#### `get_llm_model(temperature, top_p, model_name)`

Initializes and returns the Google Gemini chat model.

**Configuration Precedence:**

1. Function arguments (if provided)
2. Environment variables (`.env`)
3. Default constants

**Parameters:**

- `temperature` (float): Randomness (0.0 = deterministic, 1.0 = creative) - Optional
- `top_p` (float): Nucleus sampling - Optional
- `model_name` (str): Gemini model version - Optional

**Returns:**

- `BaseChatModel`: Configured LLM instance

**Environment Variables:**

- `GOOGLE_API_KEY` (required)
- `LLM_MODEL_NAME` (optional, default: `gemini-pro`)
- `LLM_TEMPERATURE` (optional, default: `0.1`)
- `LLM_TOP_P` (optional, default: `0.9`)

**Example:**

```python
from app.services.llm import get_llm_model

# Use defaults
llm = get_llm_model()

# Custom temperature
llm = get_llm_model(temperature=0.5)
```

---

### 6. `prompts.py` - System Prompts

#### `get_system_prompt()`

Returns the system prompt for the RAG assistant.

**Prompt Content:**

- Role: Expert accounting assistant
- Multi-language support
- Strict citation rules
- Professional tone
- Fallback behavior (when no info in documents)

**Returns:**

- `str`: Complete system prompt

**Example:**

```python
from app.services.prompts import get_system_prompt

system_prompt = get_system_prompt()
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Google Gemini Configuration
GOOGLE_API_KEY=AIza...

# LLM Settings (Optional)
LLM_MODEL_NAME=gemini-pro
LLM_TEMPERATURE=0.1
LLM_TOP_P=0.9

# Cost Optimization Settings
MAX_CONVERSATION_HISTORY=5    # Max exchanges to keep in memory
MAX_RETRIEVED_CHUNKS=5        # Max chunks to retrieve per query
```

### `.env.example`

Template with all required variables (check `backend/.env.example`).

---

## 💻 Development

### Installation

```bash
cd backend

# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync
```

### Run Server

```bash
# Development mode (auto-reload)
uv run uvicorn app.main:app --reload --port 8000

# Production mode
uv run uvicorn app.main:app --port 8000
```

### API Documentation

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

---

## 🎨 For Frontend Developers

### Quick Integration Guide

#### 1. Base URL

```typescript
const API_URL = 'http://127.0.0.1:8000';
```

#### 2. Upload Document

```typescript
async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  return await response.json();
}
```

#### 3. Ask Question

```typescript
async function askQuestion(question: string, userId: string = 'default_user') {
  const response = await fetch(`${API_URL}/chat/ask`, {
    method: 'POST',
    headers: { '
Content-Type': 'application/json' },
    body: JSON.stringify({ question, user_id: userId })
  });

  return await response.json();
}
```

#### 4. Clear Conversation

```typescript
async function clearConversation(userId: string) {
  const response = await fetch(`${API_URL}/chat/clear/${userId}`, {
    method: 'DELETE',
  });

  return await response.json();
}
```

#### 5. List Documents

```typescript
async function listDocuments() {
  const response = await fetch(`${API_URL}/documents/list`);
  return await response.json();
}
```

### TypeScript Types

```typescript
// Request/Response Models
interface ChatRequest {
  question: string;
  user_id?: string;
}

interface ChatResponse {
  answer: string;
  sources_used: number;
  conversation_length: number;
}

interface UploadResponse {
  success: boolean;
  filename: string;
  pages_processed: number;
  chunks_created: number;
  message: string;
}

interface DeleteResponse {
  success: boolean;
  filename: string;
  chunks_deleted: number;
  message: string;
}

interface ListResponse {
  total_chunks: number;
  chunks: Array<{
    id: string;
    metadata: {
      source_filename: string;
      page_number: number;
      chunk_index: number;
      [key: string]: any;
    };
  }>;
}
```

### Error Handling

All endpoints return consistent error format:

```json
{
  "detail": "Error message here"
}
```

**Example:**

```typescript
try {
  const result = await askQuestion('Test question');
  console.log(result.answer);
} catch (error) {
  if (error.response) {
    console.error(error.response.data.detail);
  }
}
```

### CORS

CORS is configured for `localhost:3000` (Next.js default). If you use a different port, update `app/main.py`:

```python
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Add your port here
]
```

---

## 📊 Performance & Limits

### Current Limits

- **Max PDF Size:** No hard limit (limited by memory)
- **Max Conversation History:** 5 exchanges (configurable via `MAX_CONVERSATION_HISTORY`)
- **Max Retrieved Chunks:** 5 per query (configurable via `MAX_RETRIEVED_CHUNKS`)
- **Embedding Dimension:** 1536 (OpenAI text-embedding-3-small)
- **Concurrent Requests:** Unlimited (FastAPI async)

### Optimization Tips

1. **Cost Control:**

   - Adjust `MAX_CONVERSATION_HISTORY` to limit token usage
   - Adjust `MAX_RETRIEVED_CHUNKS` to reduce embedding calls

2. **Performance:**

   - Use Redis for conversation storage (Phase 5.8)
   - Enable connection pooling in Supabase
   - Add caching layer for frequent queries

3. **Scalability:**
   - Deploy with Gunicorn + Uvicorn workers
   - Use CDN for static content
   - Implement rate limiting

---

## 🚀 Production Checklist

- [ ] Set `RLS` on `document_chunks` table
- [ ] Add user authentication (Supabase Auth)
- [ ] Replace in-memory conversations with Redis
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Set up monitoring (logs, errors, performance)
- [ ] Configure environment variables securely
- [ ] Add API key rotation
- [ ] Implement backup strategy
- [ ] Add health check monitoring

---

## 📝 Notes

### Known Issues

1. **In-memory conversation storage:** Resets on server restart

   - **Fix:** Phase 5.8 (Redis integration)

2. **No user isolation:** All users share same document pool

   - **Fix:** Phase 5.4 (Supabase Auth + RLS)

3. **No OCR support:** Scanned PDFs return empty content
   - **Future:** Add Tesseract OCR integration

### Future Enhancements

- [ ] OCR for scanned PDFs (Tesseract)
- [ ] Support for DOCX, TXT files
- [ ] Streaming responses (Server-Sent Events)
- [ ] Multi-document comparison
- [ ] Document summarization
- [ ] Export answers to PDF/DOCX

---

## 🆘 Troubleshooting

### Issue: `/docs` not loading

**Cause:** Response models not properly defined

**Fix:** Check that all endpoints return proper Pydantic models or JSON-serializable dicts

### Issue: "Module not found" errors

**Cause:** Dependencies not installed or IDE cache

**Fix:**

```bash
uv sync --reinstall
```

### Issue: Supabase connection fails

**Cause:** Wrong credentials or RLS blocking requests

**Fix:**

1. Check `.env` has correct `SUPABASE_URL` and `SUPABASE_KEY`
2. Verify RLS is disabled: `ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;`

### Issue: Chat returns "I don't have any documents"

**Cause:** No documents uploaded or chunks not saved

**Fix:**

1. Check `/documents/list` - should show chunks
2. Upload a PDF via `/documents/upload`
3. Verify Supabase has rows in `document_chunks`

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain Documentation](https://python.langchain.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Google Gemini API](https://ai.google.dev/docs)

---

**Last Updated:** 2025-11-26  
**Maintained by:** DatumLens Team  
**Questions?** Check `/docs` or review the code!
