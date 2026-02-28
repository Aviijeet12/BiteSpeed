# Bitespeed Identity Reconciliation

A full-stack application for **contact identity reconciliation** — linking and consolidating customer contacts across multiple purchases using email addresses and phone numbers.

Built as a solution for the [Bitespeed Backend Task](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab16fe249b28050571f1d1fc2d4).

## Live Demo

| Service  | URL                                                    |
| -------- | ------------------------------------------------------ |
| Frontend | [https://bite-speed-roan.vercel.app](https://bite-speed-roan.vercel.app) |
| Backend  | [https://bitespeed-wzio.onrender.com](https://bitespeed-wzio.onrender.com) |
| API      | `POST https://bitespeed-wzio.onrender.com/identify`    |

> **Note:** The Render free tier spins down after inactivity. The first request may take ~30 seconds while the server wakes up.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
  - [POST /identify](#post-identify)
- [Database Schema](#database-schema)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

---

## Overview

Customers can use different email addresses and phone numbers across purchases. This service identifies and links those contacts together under a single **primary contact**, ensuring a unified view of each customer.

### Key Features

- **Create** new primary contacts when no match exists
- **Link** new information as secondary contacts when a partial match is found
- **Merge** two separate primary contacts when a request bridges them
- **Frontend UI** for testing the `/identify` endpoint in real time

---

## Architecture

```
┌──────────────────────────┐     POST /identify     ┌──────────────────────────┐
│                          │  ────────────────────▶  │                          │
│   Frontend (Vercel)      │                         │   Backend (Render)       │
│   Next.js + React        │  ◀────────────────────  │   Express + Sequelize    │
│                          │     JSON response       │                          │
│  bite-speed-roan.vercel  │                         │  bitespeed-wzio.onrender │
└──────────────────────────┘                         └────────────┬─────────────┘
                                                                  │
                                                                  ▼
                                                     ┌──────────────────────────┐
                                                     │   PostgreSQL (Render)    │
                                                     │   bitespeed_psql         │
                                                     └──────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Frontend   | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | Node.js, Express, TypeScript                        |
| ORM        | Sequelize                                           |
| Database   | PostgreSQL (production) / SQLite (local dev)        |
| Hosting    | Vercel (frontend) + Render (backend + database)     |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** (for frontend) — `npm install -g pnpm`
- **npm** (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aviijeet12/BiteSpeed.git
cd BiteSpeed

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Running Locally

Open **two terminals**:

**Terminal 1 — Backend (port 3001):**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 3000):**

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser, enter `http://localhost:3001/identify` as the API endpoint, and start testing.

---

## Deployment

### Frontend — Vercel

1. Import the repo on [vercel.com](https://vercel.com) → connect `Aviijeet12/BiteSpeed`
2. Set **Root Directory** to `.` (repo root)
3. Vercel auto-detects Next.js — deploy with defaults

### Backend — Render

1. Create a **PostgreSQL** database on [render.com](https://render.com) (free tier)
2. Create a **Web Service** → connect `Aviijeet12/BiteSpeed`
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Set environment variables (see [Environment Variables](#environment-variables))
5. Deploy — the backend auto-syncs the database schema on startup

---

## API Reference

### `POST /identify`

Identifies and consolidates a contact based on email and/or phone number.

**URL:** `/identify`

**Request Body:**

```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890"
}
```

> At least one of `email` or `phoneNumber` must be provided. Both can be sent together.

**Success Response (200):**

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

| Field                  | Type     | Description                                |
| ---------------------- | -------- | ------------------------------------------ |
| `primaryContatctId`    | number   | ID of the primary contact                  |
| `emails`               | string[] | All emails linked to this contact (primary first) |
| `phoneNumbers`         | string[] | All phone numbers linked (primary first)   |
| `secondaryContactIds`  | number[] | IDs of all secondary contacts              |

**Error Responses:**

| Status | Body                                                        |
| ------ | ----------------------------------------------------------- |
| 400    | `{ "error": "At least one of email or phoneNumber is required" }` |
| 500    | `{ "error": "Internal server error" }`                      |

---

## Database Schema

**`contacts`** table:

| Column           | Type                          | Description                          |
| ---------------- | ----------------------------- | ------------------------------------ |
| `id`             | INTEGER, PK, auto-increment  | Unique contact ID                    |
| `phoneNumber`    | STRING, nullable             | Phone number                         |
| `email`          | STRING, nullable             | Email address                        |
| `linkedId`       | INTEGER, nullable            | ID of the linked primary contact     |
| `linkPrecedence` | ENUM(`primary`, `secondary`) | Whether this is a primary or secondary contact |
| `createdAt`      | DATETIME                     | Record creation timestamp            |
| `updatedAt`      | DATETIME                     | Last update timestamp                |
| `deletedAt`      | DATETIME, nullable           | Soft-delete timestamp                |

---

## How It Works

The `/identify` endpoint follows these rules:

1. **No match found** → A new **primary** contact is created with the provided email/phone.

2. **Match found (new info)** → If the email or phone matches an existing contact but the other field is new, a **secondary** contact is created and linked to the existing primary.

3. **Match bridges two primaries** → If the email matches one primary group and the phone matches a different primary group, the **older** primary stays as primary and the **newer** one is demoted to secondary. All its secondaries are re-pointed to the surviving primary.

### Example Walkthrough

```
Request 1: { email: "a@x.com", phone: "111" }
  → Creates Contact #1 (primary)

Request 2: { email: "b@x.com", phone: "111" }
  → Phone matches #1, email is new
  → Creates Contact #2 (secondary, linkedId=1)

Request 3: { email: "c@x.com", phone: "222" }
  → No match → Creates Contact #3 (primary)

Request 4: { email: "a@x.com", phone: "222" }
  → Email matches group #1, phone matches group #3
  → #3 is demoted to secondary under #1
  → Response includes all emails/phones from both groups
```

---

## Project Structure

```
BiteSpeed/
├── app/                        # Next.js app directory
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (API setup + results)
│   └── globals.css             # Global styles
├── components/
│   ├── identity-form.tsx       # Email/phone input form
│   ├── contact-result.tsx      # Contact result display
│   ├── theme-provider.tsx      # Dark/light theme provider
│   └── ui/                     # shadcn/ui components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
├── public/                     # Static assets
├── backend/                    # Express backend (separate deployment)
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── config/
│   │   │   └── database.ts     # Sequelize DB configuration
│   │   ├── models/
│   │   │   └── Contact.ts      # Contact model
│   │   ├── routes/
│   │   │   └── identify.ts     # POST /identify route handler
│   │   └── services/
│   │       └── identifyService.ts  # Core reconciliation logic
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── package.json                # Frontend package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Default              | Description                     |
| -------------- | -------------------- | ------------------------------- |
| `PORT`         | `3001`               | Server port                     |
| `DB_DIALECT`   | `sqlite`             | `sqlite`, `postgres`, or `mysql`|
| `DB_STORAGE`   | `./database.sqlite`  | SQLite file path                |
| `DB_HOST`      | `localhost`          | DB host (non-SQLite)            |
| `DB_PORT`      | `5432`               | DB port (non-SQLite)            |
| `DB_NAME`      | `bitespeed`          | Database name (non-SQLite)      |
| `DB_USER`      | –                    | Database user (non-SQLite)      |
| `DB_PASSWORD`  | –                    | Database password (non-SQLite)  |

Copy `backend/.env.example` to `backend/.env` and adjust as needed.

### Production (Render) Environment Variables

| Key            | Value                                |
| -------------- | ------------------------------------ |
| `PORT`         | `3001`                               |
| `DB_DIALECT`   | `postgres`                           |
| `DB_HOST`      | `dpg-d6hbcpnkijhs73fdgbog-a`        |
| `DB_PORT`      | `5432`                               |
| `DB_NAME`      | `bitespeed_psql`                     |
| `DB_USER`      | `bitespeed_psql_user`                |
| `DB_PASSWORD`  | *(set from Render dashboard)*        |

---

## Author

**Avijeet** — [GitHub](https://github.com/Aviijeet12)
