# Veda Finance — LOS & CRM — Frontend (Basic Setup)

React + Vite + Tailwind CSS. This is just the base scaffold — no pages/components yet,
just confirms the toolchain works so development can start.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. You should see a "Frontend setup successful" message.

`/api/*` requests are proxied to `http://localhost:5000` (see `vite.config.js`) — that's
where the backend will run.
