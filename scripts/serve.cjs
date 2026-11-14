const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve("dist");
http
  .createServer((req, res) => {
    let p;
    try {
      p = path.resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (p !== root && !p.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (p === root) p = path.join(root, "index.html");
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".css": "text/css",
        ".png": "image/png",
      }[path.extname(p)] || "application/octet-stream",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    fs.createReadStream(p).pipe(res);
  })
  .listen(4173, "127.0.0.1", () => console.log("http://127.0.0.1:4173"));

