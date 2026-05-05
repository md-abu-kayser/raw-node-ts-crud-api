import http, { IncomingMessage, Server, ServerResponse } from "http";
import config from "./config";
import "./routes";
import {
  RouteHandler,
  routes,
  RequestWithParams,
} from "./helpers/RouteHandler";
import findDynamicRoute from "./helpers/dynamicRouteHandler";

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method?.toUpperCase() || "";
    const path = req.url || "/";

    const methodMap = routes.get(method);
    const directHandler: RouteHandler | undefined = methodMap?.get(path);

    if (directHandler) {
      directHandler(req as RequestWithParams, res);
      return;
    }

    const dynamicMatch = findDynamicRoute(method, path);
    if (dynamicMatch) {
      (req as RequestWithParams).params = dynamicMatch.params;
      dynamicMatch.handler(req as RequestWithParams, res);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: "Route not found",
        path,
      }),
    );
  },
);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
