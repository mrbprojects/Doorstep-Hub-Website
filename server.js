const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 1985;
const hostname = "0.0.0.0";
const dev = false;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`Next.js running on port ${port}`);
  });
});