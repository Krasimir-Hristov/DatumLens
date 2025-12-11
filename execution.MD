# 🚀 DatumLens RAG: Execution Plan

**Current Phase:** `Phase 6: Security & User Persistence`
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

## ✅ Фаза 2: RAG Core: Upload & Indexing

**Цел:** Изграждане на пайплайн за интелигентна обработка на PDF и съхранение в `pgvector`.

| Статус | Стъпка  | Описание                            | Технологии                                                                |
| :----: | :------ | :---------------------------------- | :------------------------------------------------------------------------ |
|   ✅   | **2.1** | **Dependencies: AI & Parsing**      | `langchain`, `openai`, `google-genai`, `pypdf`                            |
|   ✅   | **2.2** | **LangChain: Document Loading**     | `PyPDFLoader`                                                             |
|   ✅   | **2.3** | **LangChain: Structured Chunking**  | `SemanticChunker` (AI-based)                                              |
|   ✅   | **2.4** | **Embedding: OpenAI Model Setup**   | `OpenAIEmbeddings`                                                        |
|   ✅   | **2.5** | **Storage: `pgvector` Integration** | `Supabase + pgvector`                                                     |
|   ✅   | **2.6** | **API: `/upload` Endpoint**         | `FastAPI UploadFile`, Router pattern                                      |
|   ✅   | **2.7** | **API: `/delete` Endpoint**         | `DELETE` endpoint за премахване на документи и техните вектори от базата. |

---

## ✅ Фаза 3: RAG Core: Chat & Retrieval

**Цел:** Имплементиране на Хибридно Търсене и RAG веригата с Gemini за генериране на цитиран отговор.

| Статус | Стъпка  | Описание                                | Технологии                                                    |
| :----: | :------ | :-------------------------------------- | :------------------------------------------------------------ |
|   ✅   | **3.1** | **Search: Keyword Retriever (FTS)**     | `PostgreSQL FTS` ('simple' config)                            |
|   ✅   | **3.2** | **Search: Vector Retriever**            | `pgvector`, `cosine similarity`                               |
|   ✅   | **3.3** | **Search: Hybrid Search Orchestration** | `Custom scoring algorithm`, `deduplication`                   |
|   ✅   | **3.4** | **LLM: Gemini Setup**                   | `Google Gemini`, Environment-based config                     |
|   ✅   | **3.5** | **Prompt Engineering: Citation Focus**  | `System Prompts` (вкл. инструкции за Multi-language отговори) |
|   ✅   | **3.6** | **RAG Chain: Final Orchestration**      | `LangChain`, In-memory conversation history                   |
|   ✅   | **3.7** | **API: `/chat` Endpoint**               | `FastAPI`, `StreamingResponse`                                |

---

## ✅ Фаза 4: Frontend (Next.js) & State

**Цел:** Изграждане на клиентския интерфейс с модерни инструменти за управление на състоянието.

| Статус | Стъпка  | Описание                         | Технологии                             |
| :----: | :------ | :------------------------------- | :------------------------------------- |
|   ✅   | **4.1** | **Frontend Setup: Next.js & TS** | `Next.js 16`, `React 19`, `Tailwind 4` |
|   ✅   | **4.2** | **State: TanStack Query Setup**  | `TanStack Query` (Server State)        |
|   ✅   | **4.3** | **State: Zustand Setup**         | `Zustand` (Client UI State)            |
|   ✅   | **4.4** | **UX: Upload Component**         | `Drag-n-Drop`, `Mutations`             |
|   ✅   | **4.5** | **UX: Chat Interface**           | `Chat UI`, `Optimistic Updates`        |

---

## ✅ Фаза 5: Polish & Final Features

**Цел:** Внедряване на ключовата функция за хайлайтване на цитати и добавяне на SaaS-готовност.

| Статус  | Стъпка  | Описание                             | Технологии                                             |
| :-----: | :------ | :----------------------------------- | :----------------------------------------------------- |
|   ✅    | **5.1** | **Citation: Front-end Parsing**      | `Regex`, `String Manipulation`                         |
|   ✅    | **5.2** | **Knowledge: Document Registry**     | Backend: SQL Table, Storage bucket, Fallback logic     |
|   ✅    | **5.3** | **Knowledge: Management UI**         | Frontend: `/knowledge` page, CRUD operations           |
|   ✅    | **5.4** | **Safety: Duplicate Prevention**     | Backend check for duplicate uploads                    |
| Native  | **5.5** | **Citation: PDF Viewer Integration** | _Implemented via browser native viewer with `#page=X`_ |
| Skipped | **5.6** | **Citation: Highlighting Logic**     | _Postponed for v2 (requires react-pdf)_                |

---

## 🔒 Фаза 6: Security & User Persistence

**Цел:** Защита на приложението и персонализиране на данните (всеки вижда само своето).

| Статус | Стъпка  | Описание                            | Технологии                                    |
| :----: | :------ | :---------------------------------- | :-------------------------------------------- |
|   ⬜   | **6.1** | **Auth: Supabase Setup**            | Настройка на Providers (Google/Email).        |
|   ⬜   | **6.2** | **Auth: Backend Middleware**        | FastAPI dependency за валидация на JWT.       |
|   ⬜   | **6.3** | **Security: RLS Policies (DB)**     | `auth.uid()` филтри за documents и chats.     |
|   ⬜   | **6.4** | **Security: Storage Policies**      | Защита на файловете в Storage bucket.         |
|   ⬜   | **6.5** | **Frontend: Protected Routes**      | Login Page, Middleware redirects, Auth Store. |
|   ⬜   | **6.6** | **Feature: Persisted Chat History** | Запазване на история в DB с `user_id`.        |
|   ⬜   | **6.7** | **Feature: Session Memory (Redis)** | (Optional) Redis оптимизация за сесиите.      |

---

## 🎨 Фаза 7: UI/UX Polish & Mobile

**Цел:** Превръщане на грозния прототип в красиво, мобилно-оптимизирано приложение.

| Статус | Стъпка  | Описание                            | Технологии                                 |
| :----: | :------ | :---------------------------------- | :----------------------------------------- |
|   ⬜   | **7.1** | **Mobile: Responsiveness**          | Hamburger menu, touch targets, stacking.   |
|   ⬜   | **7.2** | **Design: Typography & Animations** | `framer-motion`, Fonts, Transitions.       |
|   ⬜   | **7.3** | **UX: Error States & Loading**      | Skeletons, Empty States, Error Boundaries. |

---

## 🧪 Фаза 8: Testing & QA

**Цел:** Гарантиране на качеството чрез автоматизирани тестове.

| Статус | Стъпка  | Описание                          | Технологии                               |
| :----: | :------ | :-------------------------------- | :--------------------------------------- |
|   ⬜   | **8.1** | **Testing: Backend Unit Tests**   | `pytest`, Testing RAG logic without LLM. |
|   ⬜   | **8.2** | **Testing: Frontend Integration** | `React Testing Library` / `Playwright`.  |

---

## 🤖 Фаза 9: Advanced AI Agent

**Цел:** Даване на суперсили на бота.

| Статус | Стъпка  | Описание                | Технологии                                  |
| :----: | :------ | :---------------------- | :------------------------------------------ |
|   ⬜   | **9.1** | **Agent: Tool Calling** | Позволяване на бота да вика Python функции. |
|   ⬜   | **9.2** | **Agent: Web Search**   | Интеграция с търсачка за актуални данни.    |

---

## 🚀 Фаза 10: Deployment

**Цел:** Пускане на живо.

| Статус | Стъпка   | Описание                         | Технологии                                      |
| :----: | :------- | :------------------------------- | :---------------------------------------------- |
|   ⬜   | **10.1** | **Deployment: Dockerization**    | `Dockerfile`, `docker-compose`.                 |
|   ⬜   | **10.2** | **Deployment: Production Build** | `Vercel` (Frontend), `Render/Railway` (Backend) |
