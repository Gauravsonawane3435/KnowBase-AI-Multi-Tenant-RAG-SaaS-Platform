# 🧠 KnowBase AI – Multi-Tenant RAG SaaS Platform

![Banner](https://github.com/user-attachments/assets/cd0352f3-4c51-4b1a-965a-0e5a6a5a6a5a) <!-- Replace with your actual hosted banner or local path -->

KnowBase AI is a high-performance, enterprise-ready **Retrieval-Augmented Generation (RAG)** platform designed for multi-tenant environments. It allows users to upload documents, process them into vector embeddings, and interact with their private knowledge base using advanced AI models like Google Gemini.

---

## ✨ Key Features

- **🔐 Multi-Tenant Architecture**: Robust isolation between user data ensuring privacy and security.
- **📄 Document Intelligence**: High-speed PDF parsing and intelligent chunking for optimal retrieval.
- **⚡ Vector Search**: Powered by `pgvector` for lightning-fast similarity searches across thousands of documents.
- **🤖 Gemini Integration**: Leveraging state-of-the-art LLMs from Google for accurate and context-aware responses.
- **🎨 Premium UI/UX**: A modern, glassmorphic dashboard built with Next.js 15, Tailwind CSS, and Framer Motion.
- **🐳 Dockerized Deployment**: One-command setup for the entire stack (Frontend, Backend, and Vector Database).
- **🛡️ Secure Auth**: JWT-based authentication with bcrypt password hashing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [Python 3.10+](https://www.python.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector) |
| **AI/ML** | [Google Gemini API](https://ai.google.dev/), [SQLAlchemy](https://www.sqlalchemy.org/) (ORM) |
| **DevOps** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |

---

## 📂 Project Structure

```text
KnowBase AI/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # API Endpoints (Auth, Docs, Chat, Dashboard)
│   │   ├── core/           # Security and Configurations
│   │   ├── db/             # Database session and Base models
│   │   ├── models/         # SQLAlchemy Models (Users, Documents, Embeddings)
│   │   ├── schemas/        # Pydantic Schemas for Validation
│   │   └── services/       # Business Logic (RAG Pipeline, LLM Integration)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js Application
│   ├── app/                # App Router (Dashboard, Login, Register)
│   │   ├── dashboard/      # Main User Workspace
│   │   └── (auth)/         # Auth Flow Pages
│   ├── components/         # Shared UI Components
│   ├── lib/                # API client and Context Providers
│   ├── public/             # Static Assets
│   ├── styles/            # Global CSS and Design Tokens
│   └── Dockerfile
└── docker-compose.yml      # Orchestration for the full stack
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose installed.
- A **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/)).

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Backend Settings
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_string

# Database (Automatically handled by Docker Compose)
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/knowbase
```

### 3. Launch the Application
Run the following command to build and start all services:

```bash
docker-compose up --build
```

Access the platform:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive Docs (Swagger)**: `http://localhost:8000/docs`

---

## 🧠 The RAG Workflow

1. **Ingestion**: PDFs are uploaded and parsed into text chunks.
2. **Embedding**: Chunks are converted into 768-dimensional vectors using Gemini's embedding model.
3. **Storage**: Vectors and metadata are stored in PostgreSQL via `pgvector`.
4. **Retrieval**: When a user asks a question, the system perform a similarity search to find relevant context.
5. **Generation**: The context + user query are sent to Gemini to generate a grounded, factual response.

---

## 🛡️ Security & Scalability
- **Data Isolation**: Every database query is scoped by `user_id`.
- **Async Processing**: The backend uses Python's `asyncio` for non-blocking I/O operations.
- **Connection Pooling**: Optimized database connections for high concurrency.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for the AI Community</p>
