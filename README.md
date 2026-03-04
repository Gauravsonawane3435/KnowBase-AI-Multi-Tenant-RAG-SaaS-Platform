# 🧠 KnowBase AI — Multi-Tenant RAG SaaS Platform

<div align="center">

![KnowBase AI Banner](https://github.com/user-attachments/assets/cd0352f3-4c51-4b1a-965a-0e5a6a5a6a5a)

**Production-Grade AI Infrastructure | Hybrid Search | Streaming LLM | RAG Evaluation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js%2015-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat&logo=google)](https://ai.google.dev/)

[**🚀 Get Started**](#-getting-started) • [**🏗️ Architecture**](#-system-architecture) • [**🛡️ Features**](#-key-features) • [**📊 Evaluation**](#-rag-evaluation)

</div>

---

## 🌟 Introduction

**KnowBase AI** is a high-performance, enterprise-ready **Retrieval-Augmented Generation (RAG)** platform designed for multi-tenant environments. It transforms static PDFs into dynamic, searchable knowledge bases using a state-of-the-art AI infrastructure.

Unlike standard RAG implementations, KnowBase AI features **Hybrid Search** (combining semantic and keyword logic), **Token Streaming** for real-time interaction, and an integrated **RAGAS Evaluation** pipeline to ensure accuracy and reliability.

---

## ✨ Key Features (v2.0 Upgrade)

### 🏎️ 1. Hybrid Search Engine (BM25 + Vector)
- **Semantic Search**: Powered by `pgvector` for deep meaning-based retrieval.
- **Keyword Search**: Native PostgreSQL `tsvector` (BM25-equivalent) for exact matches.
- **Reciprocal Rank Fusion (RRF)**: Advanced algorithm that merges vector and keyword rankings for 30-40% higher retrieval accuracy.

### 🌊 2. Streaming LLM Responses (SSE)
- **Real-time Interaction**: Answers appear token-by-token (ChatGPT-style) using **Server-Sent Events (SSE)**.
- **Ultra-low Latency**: Time-to-first-token reduced from seconds to milliseconds.
- **Resilient Fallback**: Automatic failover to non-streaming if network conditions are poor.

### 🧪 3. RAG Evaluation (RAGAS)
- **Continuous Quality Control**: Integrated [RAGAS](https://github.com/explodinggradients/ragas) framework.
- **4-Metric Scoring**: Measures **Context Precision**, **Context Recall**, **Faithfulness**, and **Answer Relevancy**.
- **Custom Benchmarking**: Run evaluations against your own Q&A pairs to prevent regressions.

### 🔐 4. Core SaaS Infrastructure
- **Multi-Tenant Isolation**: Robust architectural guards ensure users only ever access their private data.
- **Document Processing**: Intelligent 500-word chunking with overlap for perfect context continuity.
- **Glassmorphic UI**: Premium dashboard built with Next.js 15, Tailwind CSS, and Framer Motion.
- **Secure Auth**: JWT-based stateless authentication with bcrypt salted hashing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy 2.0](https://www.sqlalchemy.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **Database** | [PostgreSQL 15+](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector) & `tsvector` |
| **AI/ML** | [Google Gemini 2.5 Flash](https://ai.google.dev/), [RAGAS Evaluation Framework](https://github.com/explodinggradients/ragas) |
| **DevOps** | [Docker](https://www.docker.com/), [Uvicorn](https://www.uvicorn.org/) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose installed.
- A **Google Gemini API Key** (Get one at [aistudio.google.com](https://aistudio.google.com/)).

### 2. Environment Setup
Create a `.env` file in the `backend/` directory:

```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Security
JWT_SECRET=your_random_secure_string

# Database (Default for local setup)
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/knowbase
```

Create a `.env.local` in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Launch with Docker (Recommended)
```bash
docker-compose up --build
```

### 4. Local Development (Manual)
**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 The Hybrid RAG Workflow

1. **Ingestion**: PDFs are extracted and split into chunks with 10% overlap.
2. **Embedding**: Chunks are vectorized into 768 dimensions using Gemini.
3. **Indexing**: 
    - **Vector**: Stored with HNSW/IVF indexes for semantic search.
    - **Text**: Stored as `tsvector` with GIN indexes for keyword search.
4. **Retrieval**: User queries trigger parallel searches; RRF fuses the results.
5. **Generation**: Top 5 chunks are injected into a specialized prompt; Gemini streams the response.

---

## 📊 RAG Evaluation

KnowBase AI includes a built-in evaluation suite to monitor performance:

- **Endpoint**: `POST /eval/run`
- **Output**: Detailed JSON with scores from 0.0 to 1.0.
- **Example Result**:
  - `Context Precision`: 0.88 ✅ (Retrieved info is highly relevant)
  - `Faithfulness`: 0.94 ✅ (No hallucinations detected)

---

## 📄 License
Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>KnowBase AI</b> — Empowering intelligence with grounded data.<br>
  Built by <b>Gaurav Sonawane</b>
</p>
