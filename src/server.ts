import http, { IncomingMessage, Server, ServerResponse } from "http";
import config from "./config";

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    console.log("server is loading.......");

    // root route
    if (req.url === "/" && req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Hello from node js with typescript....",
          path: req.url,
        }),
      );
      return;
    }

    // health route
    if (req.url === "/api" && req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Health message OK",
          path: req.url,
        }),
      );
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  },
);

server.listen(config.port, () => {
  console.log(`server is running on port: ${config.port}`);
});
