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
