import http, { IncomingMessage, Server, ServerResponse } from "http";

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    console.log("server is loading.......");

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

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  },
);

server.listen(5000, () => {
  console.log("server is running on port 5000");
});
