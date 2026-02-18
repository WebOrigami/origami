import { isUnpackable, Tree } from "@weborigami/async-tree";
import { evaluate, OrigamiFileMap, projectGlobals } from "@weborigami/language";
import http from "node:http";
import { requestListener } from "../../server/server.js";

/**
 * The debug2 command runs this module in a child process, passing in a parent
 * path in an environment variable.
 *
 * This module starts an HTTP server that will serve resources from that tree.
 * When the server is ready, it sends a message to the parent process with the
 * port number. The parent then proxies incoming requests to that port.
 *
 * If the parent needs to start a new child process, it will tell the old one to
 * drain any in-flight requests and stop accepting new ones.
 */

const PUBLIC_HOST = "127.0.0.1";

function fail(message) {
  console.error(message);
  process.send?.({ type: "FATAL", error: message });
  process.exit(1);
}

/** @type {string} */
// @ts-ignore
const expression = process.env.ORIGAMI_EXPRESSION;
if (expression === undefined) {
  fail("Missing Origami expression");
}

const parentPath = process.env.ORIGAMI_PARENT;
if (parentPath === undefined) {
  fail("Missing Origami parent");
}

// Evaluate the expression
const parent = new OrigamiFileMap(parentPath);
const globals = await projectGlobals(parent);
let result = await evaluate(expression, { globals, mode: "shell", parent });

if (isUnpackable(result)) {
  result = await result.unpack;
}
if (result instanceof Function) {
  result = await result();
}
if (!Tree.isMaplike(result)) {
  fail("Expression did not evaluate to a maplike resource tree");
}

// Use the result as the tree of resources
const listener = requestListener(result);
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

// Drain when instructed by parent, or if parent dies.
process.on("message", (/** @type {any} */ message) => {
  if (message?.type === "DRAIN") {
    beginDrain();
  }
});
process.on("SIGTERM", beginDrain);
process.on("SIGINT", beginDrain);

process.on("disconnect", () => {
  // Parent process died, exit immediately
  console.log("Parent process disconnected, exiting...");
  process.exit(0);
});

// Listen on ephemeral port
server.listen(0, PUBLIC_HOST, () => {
  // Tell parent we're ready to receive requests on our port
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  process.send?.({ type: "READY", port });
  console.log(`Child server running at http://${PUBLIC_HOST}:${port}.`);
});
