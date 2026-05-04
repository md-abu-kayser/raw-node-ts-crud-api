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
      return;
    }

    // post route
    if (req.url === "/api/users" && req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const parseBody = JSON.parse(body);

          res.writeHead(200, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              message: "User created successfully",
              data: parseBody,
            }),
          );
        } catch (error) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Invalid JSON body",
            }),
          );
        }
      });

      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  },
);

server.listen(config.port, () => {
  console.log(`server is running on port: ${config.port}`);
});
