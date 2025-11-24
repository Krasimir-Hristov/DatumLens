# 🚀 DatumLens RAG: Execution Plan

**Current Phase:** `Phase 2: RAG Core`
**Status:** 🏗️ In Progress

---

## ✅ Фаза 1: Backend Основа & DB Setup

**Цел:** Настройване на професионална FastAPI среда, Pydantic модели и Supabase връзка.

| Статус | Стъпка  | Описание                              | Технологии                             |
| :----: | :------ | :------------------------------------ | :------------------------------------- |
|   ✅   | **1.1** | **Setup: Project Structure & `venv`** | `python`, `venv`                       |
|   ✅   | **1.2** | **Backend Setup: Core Dependencies**  | `fastapi`, `uvicorn`, `pydantic`, `uv` |
|   ✅   | **1.3** | **Models: RAG Pydantic Schema**       | `Pydantic BaseModel`, `UUID`           |
|   ✅   | **1.4** | **API: FastAPI "Health Check"**       | `FastAPI`, `CORS`                      |
|   ✅   | **1.5** | **DB: Supabase Project & Extensions** | `Supabase`, `pgvector`, `uuid-ossp`    |
|   ✅   | **1.6** | **DB: SQL Schema Creation**           | `SQL`, `PostgreSQL`                    |
|   ✅   | **1.7** | **DB: FastAPI Supabase Connector**    | `supabase-py`                          |

---

## 🏗️ Фаза 2: RAG Core: Upload & Indexing

**Цел:** Изграждане на пайплайн за интелигентна обработка на PDF и съхранение в `pgvector`.

| Статус | Стъпка  | Описание                            | Технологии                                                                |
| :----: | :------ | :---------------------------------- | :------------------------------------------------------------------------ |
|   ⬜   | **2.1** | **Dependencies: AI & Parsing**      | `langchain`, `openai`, `google-genai`, `unstructured`                     |
|   ⬜   | **2.2** | **LangChain: Document Loading**     | `UnstructuredFileLoader`                                                  |
|   ⬜   | **2.3** | **LangChain: Structured Chunking**  | `RecursiveCharacterTextSplitter`                                          |
|   ⬜   | **2.4** | **Embedding: OpenAI Model Setup**   | `OpenAIEmbeddings`                                                        |
|   ⬜   | **2.5** | **Storage: `pgvector` Integration** | `LangChain PostgresVectorStore`                                           |
|   ⬜   | **2.6** | **API: `/upload` Endpoint**         | `FastAPI UploadFile`, `BackgroundTasks`                                   |
|   ⬜   | **2.7** | **API: `/delete` Endpoint**         | `DELETE` endpoint за премахване на документи и техните вектори от базата. |

---

## 🔮 Фаза 3: RAG Core: Chat & Retrieval

**Цел:** Имплементиране на Хибридно Търсене и RAG веригата с Gemini за генериране на цитиран отговор.

| Статус | Стъпка  | Описание                                | Технологии                                                    |
| :----: | :------ | :-------------------------------------- | :------------------------------------------------------------ |
|   ⬜   | **3.1** | **Search: Keyword Retriever (FTS)**     | `PostgreSQL FTS`                                              |
|   ⬜   | **3.2** | **Search: Vector Retriever**            | `Vector Similarity Search`                                    |
|   ⬜   | **3.3** | **Search: Hybrid Search Orchestration** | `EnsembleRetriever`                                           |
|   ⬜   | **3.4** | **LLM: Gemini Setup**                   | `Google Gemini`, `LangChain`                                  |
|   ⬜   | **3.5** | **Prompt Engineering: Citation Focus**  | `System Prompts` (вкл. инструкции за Multi-language отговори) |
|   ⬜   | **3.6** | **RAG Chain: Final Orchestration**      | `LangChain`, `LCEL`                                           |
|   ⬜   | **3.7** | **API: `/chat` Endpoint**               | `FastAPI`, `StreamingResponse`                                |

---

## 🎨 Фаза 4: Frontend (Next.js) & State

**Цел:** Изграждане на клиентския интерфейс с модерни инструменти за управление на състоянието.

| Статус | Стъпка  | Описание                         | Технологии                             |
| :----: | :------ | :------------------------------- | :------------------------------------- |
|   ⬜   | **4.1** | **Frontend Setup: Next.js & TS** | `Next.js`, `TypeScript`, `TailwindCSS` |
|   ⬜   | **4.2** | **State: TanStack Query Setup**  | `TanStack Query` (Server State)        |
|   ⬜   | **4.3** | **State: Zustand Setup**         | `Zustand` (Client UI State)            |
|   ⬜   | **4.4** | **UX: Upload Component**         | `Drag-n-Drop`, `Mutations`             |
|   ⬜   | **4.5** | **UX: Chat Interface**           | `Chat UI`, `Optimistic Updates`        |

---

## ✨ Фаза 5: Polish & Final Features

**Цел:** Внедряване на ключовата функция за хайлайтване на цитати и добавяне на SaaS-готовност.

| Статус | Стъпка  | Описание                             | Технологии                                                      |
| :----: | :------ | :----------------------------------- | :-------------------------------------------------------------- |
|   ⬜   | **5.1** | **Citation: Front-end Parsing**      | `Regex`, `String Manipulation`                                  |
|   ⬜   | **5.2** | **Citation: PDF Viewer Integration** | `react-pdf`                                                     |
|   ⬜   | **5.3** | **Citation: Highlighting Logic**     | `Text Offset Calculation`                                       |
|   ⬜   | **5.4** | **Security: Supabase Auth Setup**    | `Supabase Auth`                                                 |
|   ⬜   | **5.5** | **Security: Full-Stack Integration** | `Middleware`, `Guard Clauses`                                   |
|   ⬜   | **5.6** | **UX: Document Management**          | UI за списък с файлове и бутон за изтриване (Delete & Replace). |
|   ⬜   | **5.7** | **Final: Deployment Preparation**    | `Docker`, `Vercel`/`Render`                                     |
