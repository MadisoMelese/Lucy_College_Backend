# Lucy College Backend

Node.js + Express backend for the Lucy College website and admin panel.

Features
- JWT authentication
- Role-based admin middleware (e.g. `SUPERADMIN`, `REGISTRAR`)
- File uploads with Multer (hero, gallery, etc.)
- Prisma ORM with migrations & seeding
- OpenAPI spec at `swagger.yaml`

Quick start

1. Install dependencies

```powershell
npm install
```

2. Create `.env` at the project root (example below)

3. Run Prisma migrations (and optionally seed)

```powershell
npx prisma migrate deploy
node prisma/seed.js
node prisma/admin.seed.js
```

4. Run the app

```powershell
# development (if there is an npm script such as 'dev')
npm run dev

# production
npm start
```

Environment variables (from `src/config/env.js`)

Create a `.env` file with the values you need. Example:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/lucydb?schema=public
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=2h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Important files & folders

- `src/app.js` — Express app, middleware and route mounting (includes Swagger mount at `/docs`)
- `src/server.js` — starts the HTTP server
- `src/routes/` — route definitions (website, admin, auth, about, hero, gallery, homepage, team)
- `src/controllers/` — controllers for resources
- `src/services/` — business logic and DB access
- `src/config/multer.js` — Multer upload config and storage
- `prisma/schema.prisma` — Prisma schema file
- `prisma/migrations/` — migration SQL
- `prisma/seed.js`, `prisma/admin.seed.js` — seeding scripts
- `swagger.yaml` — OpenAPI 3 spec for all routes

Swagger / API docs

A full OpenAPI 3.0 spec is included in `swagger.yaml` at the project root.

To view the docs locally (the app already mounts the docs at `/docs` in `src/app.js`):

```powershell
npm install swagger-ui-express yamljs
npm run dev
# then open http://localhost:3000/docs
```

Authentication

- Protected endpoints require an `Authorization: Bearer <token>` header.
- Tokens are created using `JWT_SECRET` and expire per `JWT_EXPIRES_IN`.

File uploads

- Routes that accept files use `multipart/form-data` and expect an `image` field (see `hero` and `gallery` routes).
- Uploaded files are served statically from `/uploads` (explicitly mounted in `src/app.js`).

Development tips

- Keep `.env` out of source control.
- Use `npx prisma generate` after changing your Prisma schema.
- Use `npx prisma studio` to inspect the database interactively.

If you want

- I can add a sample `.env.example` file to the repo.
- I can add instructions to mount the Swagger UI inside `src/server.js` (if you'd like me to commit that change).
- I can expand the `swagger.yaml` schemas with exact Prisma model fields if you want tighter API docs.
