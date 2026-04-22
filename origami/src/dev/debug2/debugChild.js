import { AsyncMap, getParent, Tree } from "@weborigami/async-tree";
import { systemCache } from "@weborigami/language";
import http from "node:http";
import path from "node:path";
import { requestListener } from "../../server/server.js";
import expressionTree from "./expressionTree.js";

/**
 * The debug parent runs this module in a child process, passing in a parent
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

/** @type {string} */
// @ts-ignore
const parentPath = process.env.ORIGAMI_PARENT_PATH;
if (parentPath === undefined) {
  fail("Missing Origami parent");
}

const quiet = process.env.ORIGAMI_QUIET === "1";

// An indirect pointer to the tree of resources;
// let treeHandle = {};

// Get a handle to the tree produced by evaluating the expression
const treeHandle = await handleToEvaluatedExpression(expression, parentPath);

// Serve the tree of resources
const listener = requestListener(treeHandle, { quiet });
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

async function handleToEvaluatedExpression(expression, parentPath) {
  const handle = Object.assign(new AsyncMap(), {
    async get(key) {
      const tree = await this.getTree();
      return tree.get(key);
    },

    async getTree() {
      const cachePath = "_expression";
      const tree = await systemCache.getOrInsertComputedAsync(
        cachePath,
        async () =>
          expressionTree({
            expression,
            parentPath,
          }),
      );
      Object.defineProperty(tree, "cachePath", {
        value: cachePath,
        writable: false,
        enumerable: true,
        configurable: true,
      });
      return tree;
    },

    async keys() {
      const tree = await this.getTree();
      return tree.keys();
    },
  });

  return handle;
}

function invalidate(filePath) {
  const parent = getParent(treeHandle);
  const root = Tree.root(parent);
  const rootPath = root.path;
  const relativePath = path.relative(rootPath, filePath);
  let isPathWithinProjectRoot = !relativePath.startsWith("..");
  const cachePath = isPathWithinProjectRoot
    ? `_project/${relativePath}`
    : filePath;
  systemCache.delete(cachePath);
  process.send?.({ type: "INVALIDATED", filePath });
}

function maybeFinishDrain() {
  if (!draining) return;
  if (serverClosed && sockets.size === 0) {
    process.send?.({ type: "DRAINED" });
    process.exit(0);
  }
}

// Drain when instructed by parent, or if parent dies.
process.on("message", async (/** @type {any} */ message) => {
  if (message?.type === "DRAIN") {
    beginDrain();
  } else if (
    message?.type === "INVALIDATE" &&
    typeof message.filePath === "string"
  ) {
    // await evaluateExpression();
    await invalidate(message.filePath);
  }
});
process.on("SIGTERM", beginDrain);
process.on("SIGINT", beginDrain);

process.on("disconnect", () => {
  // Parent process died, exit immediately
  // console.log("Parent process disconnected, exiting...");
  process.exit(0);
});

// Listen on ephemeral port
server.listen(0, PUBLIC_HOST, () => {
  // Tell parent we're ready to receive requests on our port
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  process.send?.({ type: "READY", port });
  // console.log(`Child server running at http://${PUBLIC_HOST}:${port}.`);
});
