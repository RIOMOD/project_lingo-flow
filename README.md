# Lingo Flow

## Run after clone

Requirements:

- Java 21
- Node.js
- Docker Desktop

Start the backend:

```powershell
cd backend
npm run dev
```

Open another terminal and start the frontend:

```powershell
cd frontend
npm run dev
```

The backend dev script creates `backend/.env` from `.env.example` when missing,
starts MySQL 8 with Docker Compose, waits for the MySQL healthcheck, and runs
Spring Boot through the Maven Wrapper. Flyway creates the schema and seed data.

The frontend dev script runs `npm install` only when `frontend/node_modules` is
missing, then starts Vite. Vite proxies `/api` to `http://localhost:8080`.

Demo accounts use password `Password123!`:

- `admin@example.com`
- `teacher@example.com`
- `teacher2@example.com`
- `student@example.com`
- `student2@example.com`
