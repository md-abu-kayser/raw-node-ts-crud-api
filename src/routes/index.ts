import { readUsers, writeUsers, User } from "../helpers/fileDb";
import parseBody from "../helpers/parseBody";
import { registerRoute } from "../helpers/RouteHandler";
import sendJson from "../helpers/sendJson";

registerRoute("GET", "/", (req, res) => {
  sendJson(res, 200, {
    success: true,
    message: "Hello from Node.js with TypeScript",
    path: req.url,
  });
});

registerRoute("GET", "/api", (req, res) => {
  sendJson(res, 200, {
    success: true,
    message: "Health status ok",
    path: req.url,
  });
});

registerRoute("GET", "/api/users", (req, res) => {
  const users = readUsers();

  sendJson(res, 200, {
    success: true,
    data: users,
  });
});

registerRoute("GET", "/api/users/:id", (req, res) => {
  const { id } = req.params || {};
  const users = readUsers();

  const user = users.find((item) => String(item.id) === String(id));

  if (!user) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  sendJson(res, 200, {
    success: true,
    data: user,
  });
});

registerRoute("POST", "/api/users", async (req, res) => {
  const body = await parseBody(req);
  const users = readUsers();

  const newUser: User = {
    id: Date.now(),
    ...body,
  };

  users.push(newUser);
  writeUsers(users);

  sendJson(res, 201, {
    success: true,
    message: "User created successfully",
    data: newUser,
  });
});

registerRoute("PUT", "/api/users/:id", async (req, res) => {
  const { id } = req.params || {};
  const body = await parseBody(req);

  const users = readUsers();
  const index = users.findIndex((user) => String(user.id) === String(id));

  if (index === -1) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  const currentUser = users[index];
  if (!currentUser) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  users[index] = {
    ...currentUser,
    ...body,
    id: currentUser.id,
  };

  writeUsers(users);

  sendJson(res, 200, {
    success: true,
    message: `User ${id} updated successfully`,
    data: users[index],
  });
});

registerRoute("PATCH", "/api/users/:id", async (req, res) => {
  const { id } = req.params || {};
  const body = await parseBody(req);

  const users = readUsers();
  const index = users.findIndex((user) => String(user.id) === String(id));

  if (index === -1) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  const currentUser = users[index];
  if (!currentUser) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  users[index] = {
    ...currentUser,
    ...body,
    id: currentUser.id,
  };

  writeUsers(users);

  sendJson(res, 200, {
    success: true,
    message: `User ${id} partially updated successfully`,
    data: users[index],
  });
});

registerRoute("DELETE", "/api/users/:id", (req, res) => {
  const { id } = req.params || {};
  const users = readUsers();

  const index = users.findIndex((user) => String(user.id) === String(id));

  if (index === -1) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  const deletedUser = users[index];
  if (!deletedUser) {
    sendJson(res, 404, {
      success: false,
      message: "User not found",
    });
    return;
  }

  users.splice(index, 1);
  writeUsers(users);

  sendJson(res, 200, {
    success: true,
    message: `User ${id} deleted successfully`,
    data: deletedUser,
  });
});
