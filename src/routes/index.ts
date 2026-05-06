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

addRoute("GET", "/", (req, res) => {
  // This is the home route, useful for a quick API identity check.
  sendJson(res, 200, {
    success: true,
    message: "Hello from raw Node.js with TypeScript",
    path: req.url,
  });
});

addRoute("GET", "/health", (req, res) => {
  // Health route is often used by clients, load balancers, and hosting platforms.
  sendJson(res, 200, {
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    path: req.url,
  });
});

addRoute("GET", "/api/users", (req, res) => {
  const users = readUsers();

  sendJson(res, 200, {
    success: true,
    count: users.length,
    data: users,
  });
});

addRoute("GET", "/api/users/:id", (req, res) => {
  const { id } = (req as AppRequest).params;
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

addRoute("POST", "/api/users", async (req, res) => {
  try {
    const body = (await parseBody(req)) as { name?: unknown };
    const name = body.name;

    if (!isNonEmptyString(name)) {
      return sendJson(res, 400, {
        success: false,
        message: "Name is required",
      });
    }

    const users = readUsers();
    const now = new Date().toISOString();

    const newUser: User = {
      id: getNextId(users),
      name: name.trim(),
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
    sendJson(res, 400, {
      success: false,
      message: "Invalid JSON body",
    });
  }
});

addRoute("PUT", "/api/users/:id", async (req, res) => {
  try {
    const { id } = (req as AppRequest).params;
    const userId = parsePositiveId(id);

    if (!userId) {
      return sendJson(res, 400, {
        success: false,
        message: "Invalid user id",
      });
    }

    const body = (await parseBody(req)) as { name?: unknown };
    const users = readUsers();
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      return sendJson(res, 404, {
        success: false,
        message: "User not found",
      });
    }

    // Update only allowed fields and keep the record consistent.
    if (body.name !== undefined && !isNonEmptyString(body.name)) {
      return sendJson(res, 400, {
        success: false,
        message: "Name must be a non-empty string",
      });
    }

    const currentUser = users[index]!;
    const updatedUser: User = {
      ...currentUser,
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    writeUsers(users);

    sendJson(res, 200, {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch {
    sendJson(res, 400, {
      success: false,
      message: "Invalid JSON body",
    });
  }
});

addRoute("DELETE", "/api/users/:id", (req, res) => {
  const { id } = (req as AppRequest).params;
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
