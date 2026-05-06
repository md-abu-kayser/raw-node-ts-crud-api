# Building Server with Raw Nodejs & Typescript

This project is a "raw" Node.js API (no frameworks like Express), built with TypeScript for type safety. It implements a simple CRUD (Create, Read, Update, Delete) API for managing users, using a JSON file as a fake database. Key dependencies include `dotenv` for environment variables and TypeScript for compilation.

### Prerequisites

- Node.js installed.
- TypeScript installed globally or via npm.
- Run `npm install` in the project root to install dependencies.
- Use `npm run dev` to start the development server (it uses `ts-node-dev` for hot reloading).
- The server runs on `http://localhost:5000` by default (configurable via `.env`).

---

## 1. Building a Server with Node.js

**Explanation**:
This is the foundation of any Node.js web application. Node.js provides the built-in `http` module to create a server that listens for incoming HTTP requests. Unlike frameworks like Express, we're using raw Node.js to handle requests manually. The server listens on a port, processes requests, and sends responses. Key concepts:

- **HTTP Module**: Handles low-level HTTP protocol details (e.g., parsing headers, methods, URLs).
- **Request-Response Cycle**: The server receives a request (`IncomingMessage`), processes it, and sends a response (`ServerResponse`).
- **Asynchronous Nature**: Node.js is event-driven, so the server handles multiple requests concurrently without blocking.
- **TypeScript Integration**: We use TypeScript for type safety, extending Node's types (e.g., `AppRequest` for custom params).
- **Error Handling**: Wrap handlers in promises to catch async errors and send 500 responses.
- **Why Raw Node.js?**: Teaches low-level HTTP handling, which is essential for understanding frameworks. It's lightweight but requires more boilerplate.

**Code Snippet** (from `src/server.ts` - file):

```typescript
import http, { IncomingMessage, ServerResponse } from "http";
import config from "./config";
import "./routes";
import { AppRequest } from "./types/http";
import sendJson from "./helpers/sendJson";
import {
  RouteHandler,
  findDynamicRoute,
  normalizePath,
  routes,
} from "./helpers/router";

function runHandler(
  handler: RouteHandler,
  req: AppRequest,
  res: ServerResponse,
) {
  Promise.resolve(handler(req, res)).catch((error) => {
    console.error("Route handler error:", error);

    if (!res.headersSent) {
      sendJson(res, 500, {
        success: false,
        message: "Internal server error",
      });
    }
  });
}

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method?.toUpperCase() ?? "";
    const requestUrl = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    const pathname = normalizePath(requestUrl.pathname);

    const methodMap = routes.get(method);
    const staticHandler = methodMap?.get(pathname);

    if (staticHandler) {
      return runHandler(staticHandler, req as AppRequest, res);
    }

    const dynamicMatch = findDynamicRoute(method, pathname);

    if (dynamicMatch) {
      const appReq = req as AppRequest;
      appReq.params = dynamicMatch.params;

      return runHandler(dynamicMatch.handler, appReq, res);
    }

    sendJson(res, 404, {
      success: false,
      message: "Route not found",
      method,
      path: pathname,
    });
  },
);

server.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
```

**How to Test**: Run `npm run dev`. Visit `http://localhost:5000` in a browser or use curl: `curl http://localhost:5000`. It should return a JSON response.

---

## 2. Working with Environment-Based Configuration

**Explanation**:
Configuration should vary by environment (e.g., development vs. production) without hardcoding values. We use environment variables (via `.env` files) loaded with `dotenv`. This keeps secrets (e.g., ports, DB URLs) out of code. Key concepts:

- **dotenv**: Loads `.env` files into `process.env`.
- **Default Values**: Fallbacks ensure the app runs even without `.env`.
- **Type Safety**: Parse and validate env vars (e.g., convert to numbers).
- **Security**: Never commit `.env` to Git; use `.env.example` for templates.
- **NODE_ENV**: Common env var for environment detection (e.g., for logging or caching).

**Code Snippet** (from `src/config/index.ts` - copy-paste the entire file):

```typescript
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const portValue = Number(process.env.PORT ?? 5000);

const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number.isNaN(portValue) ? 5000 : portValue,
};

export default config;
```

**How to Test**: Create a `.env` file with `PORT=3000` and `NODE_ENV=production`. Restart the server; it should log the new port and env.

---

## 3. API Routes & the Difference Between GET and POST

**Explanation**:
Routes define endpoints (URLs) and HTTP methods. GET retrieves data (idempotent, no side effects), while POST creates/updates data (not idempotent, can change state). Key concepts:

- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove).
- **Idempotency**: GET can be repeated safely; POST cannot.
- **Request Body**: GET uses query params; POST uses JSON body.
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found).
- **Routing Logic**: Map method + path to handlers.

**Code Snippet** (from `src/routes/index.ts` - relevant parts for GET and POST):

```typescript
// GET all users
addRoute("GET", "/api/users", (req, res) => {
  const users = readUsers();
  sendJson(res, 200, {
    success: true,
    count: users.length,
    data: users,
  });
});

// POST create user
addRoute("POST", "/api/users", async (req, res) => {
  try {
    const body = (await parseBody(req)) as {
      name?: unknown;
      country?: unknown;
      study?: unknown;
    };
    const { name, country, study } = body;

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(country) ||
      !isNonEmptyString(study)
    ) {
      return sendJson(res, 400, {
        success: false,
        message:
          "Name, country, and study are required and must be non-empty strings",
      });
    }

    const users = readUsers();
    const now = new Date().toISOString();

    const newUser: User = {
      id: getNextId(users),
      name: name.trim(),
      country: (country as string).trim(),
      study: (study as string).trim(),
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    writeUsers(users);

    sendJson(res, 201, {
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch {
    sendJson(res, 400, { success: false, message: "Invalid JSON body" });
  }
});
```

**How to Test**: GET: `curl http://localhost:5000/api/users`. POST: `curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{"name":"John","country":"USA","study":"CS"}'`.

---

## 4. Creating a Custom Router

**Explanation**:
A router maps requests to handlers. We build a custom one using Maps for efficiency. It supports static and dynamic routes. Key concepts:

- **Route Storage**: Map<Method, Map<Path, Handler>> for O(1) lookups.
- **Normalization**: Clean paths (remove trailing slashes).
- **Dynamic Routes**: Use `:` for params (e.g., `/users/:id`).
- **Why Custom?**: Avoids framework dependencies; teaches routing internals.

**Code Snippet** (from `src/helpers/router.ts` - copy-paste the entire file):

```typescript
import { ServerResponse } from "http";
import { AppRequest } from "../types/http";

export type RouteHandler = (
  req: AppRequest,
  res: ServerResponse,
) => void | Promise<void>;

export const routes: Map<string, Map<string, RouteHandler>> = new Map();

export function addRoute(
  method: string,
  routePath: string,
  handler: RouteHandler,
) {
  const normalizedMethod = method.toUpperCase();

  if (!routes.has(normalizedMethod)) {
    routes.set(normalizedMethod, new Map());
  }

  routes.get(normalizedMethod)!.set(routePath, handler);
}

export function normalizePath(pathname: string) {
  if (!pathname) return "/";
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "");
  }
  return pathname;
}

export function findDynamicRoute(method: string, pathname: string) {
  const methodMap = routes.get(method.toUpperCase());

  if (!methodMap) return null;

  const urlParts = normalizePath(pathname).split("/");

  for (const [routePath, handler] of methodMap.entries()) {
    if (!routePath.includes(":")) continue;

    const routeParts = normalizePath(routePath).split("/");

    if (routeParts.length !== urlParts.length) continue;

    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i]!;
      const urlPart = urlParts[i]!;

      if (routePart.startsWith(":")) {
        params[routePart.slice(1)] = decodeURIComponent(urlPart);
      } else if (routePart !== urlPart) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { handler, params };
    }
  }

  return null;
}
```

---

## 5. Using Our Custom Route Handler

**Explanation**:
Handlers are functions that process requests. We register them with `addRoute`. They receive `req` (extended with params) and `res`. Key concepts:

- **Handler Signature**: `(req, res) => void | Promise<void>`.
- **Async Support**: Use promises for async ops (e.g., file I/O).
- **Error Handling**: Centralized in `runHandler`.
- **Integration**: Imported in `server.ts` and routes.

**Code Snippet** (from `src/routes/index.ts` - example handler):

```typescript
// Home route
addRoute("GET", "/", (req, res) => {
  sendJson(res, 200, {
    success: true,
    message: "Hello from raw Node.js with TypeScript",
    path: req.url,
  });
});
```

---

## 6. Implementing sendJson & Cleaning Up Server.ts

**Explanation**:
`sendJson` simplifies JSON responses. It sets headers and serializes data. Cleaning up `server.ts` means modularizing (e.g., moving routes to separate files). Key concepts:

- **Content-Type**: Ensures JSON parsing by clients.
- **Status Codes**: Proper HTTP semantics.
- **Modularity**: Separate concerns (server logic vs. routes).

**Code Snippet** (from `src/helpers/sendJson.ts` - copy-paste the entire file):

```typescript
import { ServerResponse } from "http";

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(JSON.stringify(data, null, 2));
}

export default sendJson;
```

---

## 7. Setting Up a Fake JSON Database

**Explanation**:
For simplicity, we use a JSON file as a "database". It reads/writes user data. Key concepts:

- **File I/O**: Synchronous for simplicity (not ideal for production).
- **Atomic Writes**: Use temp file + rename to prevent corruption.
- **Initialization**: Ensure file exists on startup.

**Code Snippet** (from `src/helpers/fileDb.ts` - copy-paste the entire file):

```typescript
import fs from "fs";
import path from "path";
import { User } from "../types/user";

const dataDir = path.join(process.cwd(), "src", "data");
const filePath = path.join(dataDir, "users.json");

function ensureDatabaseFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]\n", "utf-8");
  }
}

ensureDatabaseFile();

export function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as User[]) : [];
  } catch {
    return [];
  }
}

export function writeUsers(users: User[]) {
  const tempFilePath = `${filePath}.tmp`;

  fs.writeFileSync(
    tempFilePath,
    JSON.stringify(users, null, 2) + "\n",
    "utf-8",
  );
  fs.renameSync(tempFilePath, filePath);
}
```

---

## 8. Creating parseBody & Building a Clean POST API

**Explanation**:
`parseBody` reads JSON from request bodies. Used in POST for data creation. Key concepts:

- **Streaming**: Accumulate chunks asynchronously.
- **Validation**: Parse JSON; handle errors.
- **Type Safety**: Cast to expected shape.

**Code Snippet** (from `src/helpers/parseBody.ts` - copy-paste the entire file):

```typescript
import { IncomingMessage } from "http";

async function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";

    // Collect raw request data chunk by chunk.
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(body.trim() ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

export default parseBody;
```

---

## 9. Handling Dynamic Routes

**Explanation**:
Dynamic routes use params (e.g., `:id`). The router matches them and extracts params. Key concepts:

- **Param Extraction**: Split paths and match segments.
- **URL Decoding**: Handle encoded chars.
- **Validation**: Ensure param types (e.g., positive integers).

**Code Snippet** (from `src/routes/index.ts` - GET single user):

```typescript
// GET single route
addRoute("GET", "/api/users/:id", (req, res) => {
  const id = (req as AppRequest).params?.id || "";
  const userId = parsePositiveId(id);

  if (!userId) {
    return sendJson(res, 400, {
      success: false,
      message: "Invalid user id",
    });
  }

  const users = readUsers();
  const user = users.find((item) => item.id === userId);

  if (!user) {
    return sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
  }

  sendJson(res, 200, {
    success: true,
    data: user,
  });
});
```

---

## 10. Dynamic Route Handling for PUT Requests

**Explanation**:
PUT updates resources via dynamic routes. Similar to POST but modifies existing data. Key concepts:

- **Partial Updates**: Merge new data with existing.
- **Validation**: Check required fields.
- **Timestamps**: Update `updatedAt`.

**Code Snippet** (from `src/routes/index.ts` - PUT update user):

```typescript
// PUT route
addRoute("PUT", "/api/users/:id", async (req, res) => {
  try {
    const id = (req as AppRequest).params?.id || "";
    const userId = parsePositiveId(id);

    if (!userId)
      return sendJson(res, 400, { success: false, message: "Invalid id" });

    const body = (await parseBody(req)) as {
      name?: unknown;
      country?: unknown;
      study?: unknown;
    };
    const users = readUsers();
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1)
      return sendJson(res, 404, { success: false, message: "User not found" });

    const currentUser = users[index]!;

    const updatedUser: User = {
      ...currentUser,
      ...(isNonEmptyString(body.name)
        ? { name: (body.name as string).trim() }
        : {}),
      ...(isNonEmptyString(body.country)
        ? { country: (body.country as string).trim() }
        : {}),
      ...(isNonEmptyString(body.study)
        ? { study: (body.study as string).trim() }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    writeUsers(users);

    sendJson(res, 200, {
      success: true,
      message: "Updated",
      data: updatedUser,
    });
  } catch {
    sendJson(res, 400, { success: false, message: "Invalid JSON body" });
  }
});
```

---

## Interview Questions Preparation

Here are 10+ interview-style questions based on this project, with answers. These cover Node.js, HTTP, TypeScript, and API design.

1. **What is the difference between GET and POST in HTTP?**  
   GET retrieves data (idempotent, no body changes), POST creates/updates (not idempotent, uses body).

2. **How does Node.js handle asynchronous operations in this server?**  
   Via promises and event emitters (e.g., `req.on('data')` for streaming bodies).

3. **Why use TypeScript over plain JavaScript for this API?**  
   Type safety prevents runtime errors (e.g., type-checking `User` interface).

4. **Explain how the custom router handles dynamic routes.**  
   It splits paths, matches segments with `:param`, and extracts params into `req.params`.

5. **What are the pros/cons of using a JSON file as a database?**  
   Pros: Simple, no setup. Cons: Not scalable, no concurrency, data loss on crashes.

6. **How does `parseBody` work, and why is it asynchronous?**  
   It listens to `req` events to accumulate chunks, then parses JSON. Async because data arrives in streams.

7. **What is idempotency, and why does it matter for APIs?**  
   Idempotent operations (e.g., GET) produce the same result if repeated. Ensures reliability.

8. **How would you add authentication to this API?**  
   Use middleware to check headers (e.g., JWT), reject unauthorized requests.

9. **Explain environment-based configuration.**  
   Use `.env` files for vars like PORT, loaded via `dotenv`, to avoid hardcoding secrets.

10. **What happens if two requests try to update the same user simultaneously?**  
    Race conditions possible with file DB; use locks or a real DB (e.g., SQLite) for concurrency.

11. **How does `sendJson` ensure proper HTTP responses?**  
    Sets `Content-Type` to `application/json` and status codes for client parsing.

12. **Why normalize paths in the router?**  
    Prevents issues with trailing slashes (e.g., `/users/` vs `/users`).

13. **What are the security risks in this API?**  
    No input sanitization beyond trimming; vulnerable to injection if not careful. No rate limiting.

14. **How would you scale this to production?**  
    Use a real DB (e.g., PostgreSQL), add clustering, caching, and monitoring.

15. **Explain the role of `AppRequest` in TypeScript.**  
    Extends `IncomingMessage` to add `params` for dynamic routes, enabling type-safe param access.

Use these to practice explaining code verbally. If you need more details or modifications, let me know!
