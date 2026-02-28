# Deploying KnowBase AI with Docker

This guide explains how to deploy the full "KnowBase AI – Multi-Tenant RAG SaaS Platform" stack using Docker.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Setup
Before running the containers, create a `.env` file in the root directory (same folder as `docker-compose.yml`) with the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_key_here
```

## Running the Stack
1. Open your terminal in the root directory.
2. Build and start the services:
   ```bash
   docker-compose up --build
   ```
3. Once the build is complete, you can access:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Services Overview
- **db**: PostgreSQL database with `pgvector` extension enabled. Data is persisted in a named volume (`postgres_data`).
- **backend**: FastAPI application running on port 8000. It waits for the database to be healthy before starting.
- **frontend**: Next.js application running on port 3000.

## Troubleshooting
- If the database fails to start, ensure no other service is using port 5432.
- If the backend cannot connect to the database, check the `DATABASE_URL` in `docker-compose.yml`.
- Ensure your Gemini API Key is valid, otherwise RAG features will fail.
