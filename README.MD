# 🤖 DatumLens: Digital Knowledge Management Hub and AI Assistant

**DatumLens** is a Fullstack application engineered to serve as a **SaaS** platform for the secure management of **personal and family documents** and the rapid extraction of information via a **Retrieval-Augmented Generation (RAG)**-powered AI assistant.

The project is built with an emphasis on **modularity, high performance, and the integration of cutting-edge AI technologies**, demonstrating expertise in developing scalable **AI-powered systems**.

---

## 🎯 Key Goals and Scope (MVP)

1.  **SaaS-Ready Architecture:** Establishing a scalable, modular Backend (FastAPI) and Frontend (Next.js App Router) for streamlined deployment and scaling.
2.  **Data Sovereignty & PII Security:** Strict protection of Personally Identifiable Information (PII) through **Row Level Security (RLS)** in Supabase.
3.  **RAG AI Engine:** Implementation of an AI Chatbot that retrieves context from **user-owned documents** (Vector DB/pg_vector) to generate accurate, personalized responses.
4.  **UX/UI:** A professional user interface (shadcn/ui) featuring a **persistent (sticky)** AI Chat Widget for immediate, contextual access to information.

---

## 🛠️ Technology Stack

The project is structured around two primary services: Frontend and Backend.

### 1. Frontend (Next.js 16.0.3 / TypeScript)

| Component            | Technology                                            | Purpose                                                            |
| :------------------- | :---------------------------------------------------- | :----------------------------------------------------------------- |
| **Framework**        | **Next.js 16.0.3** (App Router), TypeScript, React 19 | Provides SSR, routing, and high performance.                       |
| **Styling/UI**       | **Tailwind CSS**, **shadcn/ui** (Radix-UI based)      | Atomic, accessible, and professional UI components.                |
| **State (Server)**   | **TanStack Query v5**                                 | Manages server state, caching, and background updates effectively. |
| **State (UI)**       | **Zustand v5**                                        | Lightweight management of local UI state.                          |
| **Forms/Validation** | **React Hook Form**, **Zod**                          | **Best Practice** for defining strict form validation schemas.     |

### 2. Backend (Python / FastAPI / AI)

| Component            | Technology                    | Purpose                                                  |
| :------------------- | :---------------------------- | :------------------------------------------------------- |
| **Web Framework**    | **FastAPI**                   | High-performance, asynchronous Python API Gateway.       |
| **AI Framework**     | **LangChain** / **LangGraph** | Orchestrates complex LLM workflows and RAG pipelines.    |
| **LLM / Embeddings** | **Google Gemini Models**      | Used for LLM inference and generating vector Embeddings. |
| **DB Client**        | **`supabase`**                | Official, modern Python client for data access.          |

### 3. Data Layer & Infrastructure

| Component           | Technology                           | Purpose                                                     |
| :------------------ | :----------------------------------- | :---------------------------------------------------------- |
| **Database/Auth**   | **Supabase (PostgreSQL)**            | RDBMS, Authentication, and **RLS enforcement**.             |
| **Vector Database** | **`pg_vector`** (Supabase Extension) | High-efficiency storage and retrieval of vector embeddings. |
| **File Storage**    | **Supabase Storage**                 | Secure storage for binary files (e.g., PDFs, JPEGs).        |

---

## 🏛️ Backend Architecture (Modular Design)

The Backend adheres to **Modular Architecture** and **Clean Architecture** principles, divided into clear logical modules for optimal scalability:

| Folder                  | Responsibility              | Key Concept                                                        |
| :---------------------- | :-------------------------- | :----------------------------------------------------------------- |
| **`app/api/`**          | FastAPI Routers (Endpoints) | Definition of API routes.                                          |
| **`app/core/`**         | Core Business Logic (CRUD)  | **Service Layer:** Pure, testable application logic.               |
| **`app/ai/`**           | AI/LLM Logic                | **Service Layer:** Abstraction for LangChain/RAG operations.       |
| **`app/dependencies/`** | Dependency Injection        | **Security Gates:** Enforcing JWT/RLS filters on endpoints.        |
| **`app/models/`**       | Pydantic Schemas            | **Data Contracts:** Strict data validation for requests/responses. |

---

## ⚙️ Installation and Startup

### 1. Backend (Python/FastAPI)

1.  **Create/Activate Venv:**
    ```bash
    python3 -m venv .venv
    source .venv/Scripts/activate # Windows
    ```
2.  **Install Dependencies (using `uv`):**
    ```bash
    uv pip install -r requirements.txt
    uv pip install -r requirements-dev.txt
    ```
3.  **Run the Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    (API accessible at http://127.0.0.1:8000)

### 2. Frontend (Next.js)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run the App:**
    ```bash
    npm run dev
    ```
    (App accessible at http://localhost:3000)

---

## 🔐 Security Configuration

To run the application, you must create a **`backend/.env`** file with the following variables:

```env
# Supabase Credentials (Public URL and Anon Key for initial connection/Auth)
SUPABASE_URL="[Your Supabase Project URL]"
SUPABASE_ANON_KEY="[Your Supabase Project Anon Key]"

# Gemini API Key (Required for LLM and Embeddings)
GEMINI_API_KEY="[Your Google AI Studio API Key]"

# Note: The Supabase Service Role Key is handled securely via the CLI for migrations.
```
