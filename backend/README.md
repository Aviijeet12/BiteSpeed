# Bitespeed Backend – Identity Reconciliation

Node.js + Express + Sequelize backend that consolidates contact identity across multiple purchases using email and phone number matching.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Sequelize
- **Database:** SQLite (default) – swappable to PostgreSQL / MySQL via `.env`
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Start in development mode (hot-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server runs on **http://localhost:3001** by default.

## API

### `POST /identify`

**Request body:**

```json
{
  "email": "user@example.com",
  "phoneNumber": "+1234567890"
}
```

At least one of `email` or `phoneNumber` must be provided.

**Response:**

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["+1234567890"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

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

## Database Schema

**`contacts`** table:

| Column           | Type                        | Notes                    |
| ---------------- | --------------------------- | ------------------------ |
| `id`             | INTEGER, PK, auto-increment |                          |
| `phoneNumber`    | STRING, nullable            |                          |
| `email`          | STRING, nullable            |                          |
| `linkedId`       | INTEGER, nullable           | FK → contacts.id         |
| `linkPrecedence` | ENUM('primary','secondary') |                          |
| `createdAt`      | DATETIME                    |                          |
| `updatedAt`      | DATETIME                    |                          |
| `deletedAt`      | DATETIME, nullable          | Soft-delete              |

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── config/
│   │   └── database.ts          # Sequelize connection config
│   ├── models/
│   │   └── Contact.ts           # Contact model
│   ├── routes/
│   │   └── identify.ts          # POST /identify route
│   └── services/
│       └── identifyService.ts   # Core reconciliation logic
├── .env.example
├── package.json
└── tsconfig.json
```
