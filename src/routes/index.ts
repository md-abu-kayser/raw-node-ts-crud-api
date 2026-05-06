import { addRoute } from "../helpers/router";
import sendJson from "../helpers/sendJson";
import parseBody from "../helpers/parseBody";
import { isNonEmptyString, parsePositiveId } from "../helpers/validators";
import { readUsers, writeUsers } from "../helpers/fileDb";
import { User } from "../types/user";
import { AppRequest } from "../types/http";

function getNextId(users: User[]) {
  return users.length === 0 ? 1 : Math.max(...users.map((user) => user.id)) + 1;
}

// Home route
addRoute("GET", "/", (req, res) => {
  sendJson(res, 200, {
    success: true,
    message: "Hello from raw Node.js with TypeScript",
    path: req.url,
  });
});

// Health route
addRoute("GET", "/health", (req, res) => {
  sendJson(res, 200, {
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    path: req.url,
  });
});

// GET all route
addRoute("GET", "/api/users", (req, res) => {
  const users = readUsers();

  sendJson(res, 200, {
    success: true,
    count: users.length,
    data: users,
  });
});

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

// POST route
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

// DELETE route
addRoute("DELETE", "/api/users/:id", (req, res) => {
  const id = (req as AppRequest).params?.id || "";
  const userId = parsePositiveId(id);

  if (!userId) {
    return sendJson(res, 400, {
      success: false,
      message: "Invalid user id",
    });
  }

  const users = readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    return sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
  }

  const deletedUser = users[index];
  users.splice(index, 1);
  writeUsers(users);

  sendJson(res, 200, {
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
});
