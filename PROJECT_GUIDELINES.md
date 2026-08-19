# PROJECT GUIDELINES

> **This file is the source of truth for anyone — human or AI — working on this backend.**  
> Read it before writing or modifying any code.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Folder Structure](#2-folder-structure)
3. [Folder Responsibilities](#3-folder-responsibilities)
4. [Request Flow](#4-request-flow)
5. [Controller Responsibilities](#5-controller-responsibilities)
6. [Service Responsibilities](#6-service-responsibilities)
7. [Model Responsibilities](#7-model-responsibilities)
8. [Middleware Responsibilities](#8-middleware-responsibilities)
9. [Validation Rules](#9-validation-rules)
10. [Error Handling](#10-error-handling)
11. [Authentication Conventions](#11-authentication-conventions)
12. [Naming Conventions](#12-naming-conventions)
13. [Environment Variables](#13-environment-variables)
14. [When to Create a New File](#14-when-to-create-a-new-file)
15. [When to Create a New Folder](#15-when-to-create-a-new-folder)
16. [When NOT to Create a New Abstraction](#16-when-not-to-create-a-new-abstraction)
17. [How to Avoid Over-Engineering](#17-how-to-avoid-over-engineering)
18. [Rules for AI/Coding Agents](#18-rules-for-aicoding-agents)

---

## 1. Overview

This is a **Node.js + Express + JavaScript** backend.

**Core principle:** Keep the backend simple, organized, and scalable — without over-engineering it.

**Technology stack:**

| Layer       | Technology              |
|-------------|-------------------------|
| Runtime     | Node.js                 |
| Framework   | Express.js              |
| Database    | MongoDB via Mongoose    |
| Auth        | JWT (jsonwebtoken)      |
| Passwords   | bcryptjs                |
| Environment | dotenv                  |

---

## 2. Folder Structure

```
RAG_backend/
├── src/
│   ├── config/
│   │   ├── db.js           # Database connection
│   │   └── env.js          # Environment variable validation & export
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── formatResponse.js
│   │   └── generateToken.js
│   ├── validators/
│   │   └── authValidator.js
│   ├── app.js              # Express app creation & configuration
│   └── server.js           # Entry point: DB connect + HTTP server
├── .env                    # Local secrets — NEVER commit
├── .env.example            # Template — commit this
├── .gitignore
├── package.json
└── PROJECT_GUIDELINES.md   # This file
```

---

## 3. Folder Responsibilities

### `config/`
- **db.js** — Mongoose connection logic. Called once from `server.js`.
- **env.js** — Validates required env vars at startup, exports them as named constants. The rest of the app reads from here, **not** from `process.env` directly.

Do **not** put business logic inside `config/`.

---

### `models/`
- Define database schemas and field constraints.
- Define relationships and indexes.
- May include model-specific hooks (e.g., password hashing pre-save) and instance methods (e.g., `comparePassword`).
- Do **not** put application business logic, HTTP concerns, or complex workflows inside models.

---

### `controllers/`
Controllers handle the HTTP layer only:
1. Read data from `req`.
2. Call the appropriate service.
3. Return a `res` response.
4. Forward errors with `next(err)`.

Controllers should be short. If a controller function grows large, business logic has leaked in — move it to a service.

---

### `services/`
Services contain business and application logic:
- Multi-step operations
- Reusable logic
- Business rules that should be separated from HTTP concerns

Services receive plain data (not `req`/`res`) and return plain results or throw errors with a `statusCode` property.

Do **not** create a service for every tiny function. A controller may call a model directly for simple CRUD.

---

### `routes/`
Route files define API endpoints and wire validators + controllers together. They must remain thin.

```js
// Good
router.post("/login", validateLogin, authController.login);

// Bad — logic inside a route
router.post("/login", async (req, res) => { /* 50 lines of logic */ });
```

---

### `middleware/`
Express middleware for cross-cutting concerns:
- **authMiddleware.js** — JWT verification, attaches `req.user`
- **errorMiddleware.js** — Central error handler (must be registered last in `app.js`)

Add middleware here only for genuinely cross-cutting concerns. Do not put business logic inside middleware.

---

### `validators/`
Request validators as Express middleware functions. Validate input **before** it reaches the controller.

Use when:
- Validation logic is reusable across multiple routes
- Validation is complex enough to warrant isolation

For a single-use, trivial check, inline validation in the controller is acceptable.

---

### `utils/`
Genuinely reusable helper functions:
- **generateToken.js** — Issues a signed JWT
- **formatResponse.js** — Consistent JSON response shape

**Before adding to `utils/`**, ask: *"Is this actually reused in multiple places?"*  
If not, keep it in the file where it is used.

---

### `app.js`
- Creates the Express app
- Registers global middleware (JSON parsing, CORS, etc.)
- Mounts all route files
- Registers the central error handler (last)
- **Exports the app** — does not start the server

---

### `server.js`
- Loads `dotenv`
- Calls `connectDB()`
- Calls `app.listen()`
- Handles graceful shutdown (`SIGTERM`, `SIGINT`)
- **Does not** contain routes, middleware, or business logic

---

## 4. Request Flow

### Simple CRUD (no meaningful business logic)

```
Request → Route → Controller → Model → Response
```

### Standard operation (with business logic)

```
Request → Route → Middleware → Validator → Controller → Service → Model → Response
```

Do **not** force every endpoint through every layer. Choose the simplest flow that correctly handles the requirement.

---

## 5. Controller Responsibilities

✅ Read from `req.body`, `req.params`, `req.query`, `req.user`  
✅ Call a service (or a model directly for simple cases)  
✅ Return `res.status(...).json(...)`  
✅ Forward errors with `next(err)`  

❌ Do not write business logic  
❌ Do not write complex database queries  
❌ Do not repeat response formatting — use `formatResponse.js`  

---

## 6. Service Responsibilities

✅ Orchestrate multi-step operations  
✅ Implement business rules  
✅ Return plain objects or throw errors (`error.statusCode = 4xx`)  
✅ Call models for database access  

❌ Do not import `req`, `res`, or `next`  
❌ Do not write HTTP responses  
❌ Do not create a service just to follow a pattern when a direct model call suffices  

---

## 7. Model Responsibilities

✅ Define schema, fields, types, constraints  
✅ Define indexes and relationships  
✅ Pre-save hooks tightly coupled to data (e.g., password hashing)  
✅ Instance methods tightly coupled to documents (e.g., `comparePassword`)  

❌ Do not put application workflows or business rules inside models  
❌ Do not import services or other models unnecessarily  

---

## 8. Middleware Responsibilities

✅ Authenticate requests (`authMiddleware.js`)  
✅ Handle all errors centrally (`errorMiddleware.js`)  
✅ Process requests before they reach controllers (rate limiting, logging, etc.)  

❌ Do not put business logic in middleware  
❌ Do not mix concerns — each middleware file has one responsibility  

---

## 9. Validation Rules

- Validation runs **before** the controller.
- Validators are Express middleware functions that call `next()` on success or return a 400 response on failure.
- Use `validators/` for reusable or complex validation.
- Do not duplicate the same validation logic in multiple controllers.
- For simple, one-off checks, inline validation in the controller is acceptable.

---

## 10. Error Handling

Errors are handled centrally by `errorMiddleware.js`.

**Pattern — service/model throws:**
```js
const error = new Error("Email already registered.");
error.statusCode = 409;
throw error;
```

**Pattern — controller forwards:**
```js
const doSomething = async (req, res, next) => {
  try {
    const result = await someService.doWork(req.body);
    res.json(success(result));
  } catch (err) {
    next(err); // goes to errorMiddleware
  }
};
```

**Rules:**
- Use `error.statusCode` to signal HTTP status from services.
- Do **not** repeat response formatting in every catch block.
- Keep error messages consistent across the API.
- Never expose stack traces in production (`NODE_ENV=production`).

---

## 11. Authentication Conventions

Files related to authentication:

| File | Responsibility |
|------|---------------|
| `routes/authRoutes.js` | `/api/auth` endpoint definitions |
| `validators/authValidator.js` | Input validation for auth requests |
| `controllers/authController.js` | HTTP request/response for auth |
| `services/authService.js` | Registration and login business logic |
| `middleware/authMiddleware.js` | JWT verification, populates `req.user` |
| `utils/generateToken.js` | JWT creation |

**Rules:**
- JWT secret lives in `.env` → accessed via `config/env.js`.
- Passwords are hashed in the model pre-save hook (tight coupling to schema is appropriate here).
- Never return the `password` field in responses (schema has `select: false`).
- Protected routes use the `protect` middleware from `authMiddleware.js`.

---

## 12. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | camelCase | `authService.js`, `generateToken.js` |
| Variables & functions | camelCase | `getUserById`, `formatResponse` |
| Classes / Mongoose models | PascalCase | `User`, `Post` |
| Constants | UPPER_SNAKE_CASE (optional) | `MAX_RETRIES` |
| Route prefixes | kebab-case | `/api/auth`, `/api/user-profiles` |

Use descriptive names. Avoid abbreviations that obscure meaning.

---

## 13. Environment Variables

**Required variables** (see `.env.example`):

```
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
```

**Rules:**
- `.env` is in `.gitignore` — **never commit it**.
- `.env.example` is committed — **no real secrets in it**.
- All env vars are validated and exported from `src/config/env.js`.
- The rest of the application imports from `config/env.js`, not from `process.env` directly.
- When adding a new required env var, update **both** `.env.example` and `config/env.js`.

---

## 14. When to Create a New File

Create a new file when:

- A new domain is introduced (e.g., `Post`) → create `models/Post.js`, `controllers/postController.js`, etc.
- An existing file grows too large and a clear responsibility can be extracted.
- A utility function is genuinely reused in three or more places.

Do **not** create a new file just to match a pattern or to "be consistent" when a few lines of code would suffice inline.

---

## 15. When to Create a New Folder

Create a new folder only when:

- A new top-level concern is introduced that does not fit existing folders (rare).
- A single folder grows to contain so many files that navigation becomes difficult (e.g., 10+ controllers for very different domains).

Do **not** create sub-folders inside `controllers/`, `services/`, etc. unless the project has genuinely grown to a scale that requires it. Start flat. Reorganize later if necessary.

---

## 16. When NOT to Create a New Abstraction

Do **not** introduce:

- `BaseController`, `BaseService`, `BaseRepository`
- `GenericManager`, `Factory`, `Registry`
- Dependency injection containers
- Interface layers
- A `repositories/` folder — unless there are multiple data sources, complex persistence logic, or a genuine testing requirement

For a normal Express/Mongoose application:

```
Controller → Service → Model
```

is sufficient. Introduce complexity only when a concrete problem demands it.

---

## 17. How to Avoid Over-Engineering

Ask these questions before writing code:

1. **Does this already exist?** Check existing services, utils, and middleware first.
2. **Is this reused in more than one place?** If not, keep it where it is used.
3. **Does this abstraction solve a real problem?** If you cannot name the concrete problem, do not create the abstraction.
4. **Am I adding a layer for clarity or for habit?** Add layers for clarity only.
5. **Will this be harder to read next week?** Prefer readable code over clever code.
6. **Is the architecture proportional to the app size?** Do not build a microservice architecture for a 5-endpoint API.

---

## 18. Rules for AI/Coding Agents

> These rules apply to any AI assistant, coding agent, or automated tool that modifies this codebase.

1. **Read `PROJECT_GUIDELINES.md` before modifying the backend.**
2. **Inspect the existing code before creating new files.** Check whether a suitable service, utility, middleware, or model already exists.
3. **Reuse existing services, utilities, middleware, and models when possible.**
4. **Do not create duplicate functionality.** Search the codebase for similar logic before implementing something new.
5. **Do not create unnecessary folders.** The existing structure accommodates most features. Add folders only when genuinely required.
6. **Do not introduce a new architectural pattern without a concrete reason.** Document the reason if you do.
7. **Keep routes thin.** Routes contain only endpoint definitions, middleware references, and controller references.
8. **Keep controllers focused on HTTP concerns.** Controllers read `req`, call a service, and write `res`. Nothing more.
9. **Put business logic in services when appropriate.** If logic involves multiple operations or business rules, it belongs in a service.
10. **Keep database logic inside models/services as appropriate.** Controllers do not write raw database queries.
11. **Keep validation separate when it becomes reusable or complex.** Place validators in `validators/`.
12. **Use centralized error handling.** Throw errors with `statusCode`, forward with `next(err)`. Do not repeat error formatting in every controller.
13. **Never hard-code secrets.** All secrets live in `.env` and are accessed via `config/env.js`.
14. **Do not add dependencies without checking whether the existing stack already solves the problem.**
15. **Do not refactor unrelated code while implementing a feature.**
16. **Do not rename or move existing files unnecessarily.**
17. **Preserve existing API behavior unless the task explicitly requires changing it.**
18. **Before creating a new abstraction, determine whether a simpler solution is sufficient.**
19. **Prefer readable code over clever code.**
20. **Keep the architecture proportional to the size and complexity of the application.**

---

*Last updated: 2026-08-19*
