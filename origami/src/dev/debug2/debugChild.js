import { OrigamiFileMap } from "@weborigami/language";
import http from "node:http";
import { requestListener } from "../../server/server.js";

const PUBLIC_HOST = "127.0.0.1";

const parentPath = process.env.ORIGAMI_PARENT;
if (!parentPath) {
  process.send?.({ type: "FATAL", error: "Missing ORIGAMI_PARENT" });
  process.exit(1);
}

const tree = new OrigamiFileMap(parentPath);
const listener = requestListener(tree);
const server = http.createServer(listener);

// Track live connections so we can drain/close cleanly.
const sockets = new Set();
server.on("connection", (socket) => {
  sockets.add(socket);
  socket.on("close", () => sockets.delete(socket));
});

// Helpful to avoid the old child keeping idle sockets around forever during drain.
server.keepAliveTimeout = 1000;
server.headersTimeout = 5000;

// Draining state
let draining = false;
let serverClosed = false;

function maybeFinishDrain() {
  if (!draining) return;
  if (serverClosed && sockets.size === 0) {
    process.send?.({ type: "DRAINED" });
    process.exit(0);
  }
}

function beginDrain() {
  if (draining) return;
  draining = true;

  // Stop accepting new connections.
  server.close(() => {
    serverClosed = true;
    maybeFinishDrain();
  });

  // Give in-flight requests a moment, then force-close remaining sockets.
  const GRACE_MS = 1200;
  setTimeout(() => {
    for (const socket of sockets) {
      // This will also abort any in-flight requests on that socket if still active.
      socket.destroy();
    }
    // socket "close" events will shrink the set; check again soon.
    setTimeout(maybeFinishDrain, 50).unref();
  }, GRACE_MS).unref();

  // Absolute last resort: don’t hang forever.
  const HARD_MS = 3000;
  setTimeout(() => process.exit(0), HARD_MS).unref();
}

process.on("message", (message) => {
  if (message && typeof message === "object" && message.type === "DRAIN") {
    beginDrain();
  }
});

process.on("SIGTERM", beginDrain);
process.on("SIGINT", beginDrain);

// Listen on ephemeral port and announce readiness.
server.listen(0, PUBLIC_HOST, () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  process.send?.({ type: "READY", port });
  console.log(`Child server running at http://${PUBLIC_HOST}:${port}.`);
});
