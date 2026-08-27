# Veda Finance — LOS & CRM — Backend (Basic Setup)

Node.js + Express + PostgreSQL. Just the base scaffold — confirms the server runs and
connects to PostgreSQL, so development can start.

## Prerequisites
- Node.js 18+
- PostgreSQL running locally

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials, then create the database:

```bash
createdb veda_los
```

Start the server:

```bash
npm run dev
```

Runs at `http://localhost:5000`.

- `GET /api/health` → `{ "status": "ok" }`
- `GET /api/db-check` → confirms PostgreSQL connection is working
