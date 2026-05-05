import addRoutes from "../helpers/RouteHandler";
import sendJson from "../helpers/sendJson";

addRoutes("GET", "/", (req, res) => {
  sendJson(res, 200, {
    message: "Hello from node js with typescript....",
    path: req.url,
  });
});

addRoutes("GET", "/api", (req, res) => {
  sendJson(res, 200, {
    message: "health route ok",
    path: req.url,
  });
});
