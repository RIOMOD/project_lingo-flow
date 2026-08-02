# Lingo Flow

## Run locally on Windows

Requirements:

- Java 21
- Node.js
- Docker Desktop only if you want to run MySQL instead of the default local H2 database

Install JavaScript dependencies:

```powershell
npm.cmd run install:all
```

Start backend and frontend together:

```powershell
npm.cmd run dev
```

Use `npm.cmd` in PowerShell if `npm` is blocked by the Windows execution policy.

By default, the backend runs with the H2 file database configured in
`backend/src/main/resources/application.yml`. To run with MySQL, copy
`backend/.env.example` to `backend/.env`, start MySQL from `backend/docker-compose.yml`,
and then run `npm.cmd run dev`.

Frontend: http://localhost:5173

Backend health check: http://localhost:8080/api/health

Demo accounts use password `Password123!`:

- `admin@example.com`
- `teacher@example.com`
- `teacher2@example.com`
- `student@example.com`
- `student2@example.com`

đã có chatbot AI
