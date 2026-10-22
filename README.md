# ReturnDesk

ReturnDesk is a Next.js application for creating and viewing customer return requests. It uses PostgreSQL to store return request data.

## Requirements

- Node.js and npm
- A PostgreSQL database

## Setup

From the `my-app` directory, install dependencies:

```bash
npm install
```

Create a `.env.local` file in the `my-app` directory and configure the database connection:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
DB_SSL=false
```

Replace the connection string with the one for your database. Set `DB_SSL=true` if your provider requires TLS. The app verifies TLS certificates by default. Only set `DB_SSL_REJECT_UNAUTHORIZED=false` if your provider explicitly requires disabling certificate verification.

Do not commit `.env.local` or share its contents; the database URL contains credentials.

## Database Schema

Create the tables and indexes by running `src/lib/schema.sql` against your PostgreSQL database. For example, with `psql`:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DATABASE" -f src/lib/schema.sql
```

The schema creates `return_requests` and `return_notes`. The API currently uses `return_requests`.

## Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

### Check the database connection

```http
GET /api/db-test
```

Returns a success response and database timestamp when the connection works.

### List return requests

```http
GET /api/returns
```

Returns unarchived requests, newest first.

### Create a return request

```http
POST /api/returns
Content-Type: application/json
```

Example request body:

```json
{
	"order_number": "ORD-1002",
	"customer_name": "Jordan Lee",
	"item_name": "Blue jacket",
	"quantity": 1,
	"reason": "Damaged"
}
```

Allowed reasons are `Damaged`, `Wrong Item`, `Size Issue`, `Not As Described`, and `Changed Mind`. A successful creation returns HTTP `201` with the new request. Invalid input returns `400`; a database error returns `500`.

## Available Scripts

```bash
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Build the production app
npm run start  # Start the production server after building
```
