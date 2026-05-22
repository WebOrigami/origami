import { AsyncMap, Tree } from "@weborigami/async-tree";
import {
  activeProjectRoot,
  projectRootFromPath,
  systemCache,
} from "@weborigami/language";
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

const projectRoot = await projectRootFromPath(parentPath);
activeProjectRoot.set(projectRoot);
projectRoot.watch();

// Traverse from the project root to the indicated parent.
const relative = path.relative(projectRoot.path, parentPath);
const parent = await Tree.traversePath(projectRoot, relative);

// Notify parent if a file changes
projectRoot.addEventListener("change", async (/** @type {any} */ event) => {
  const { filePath } = event.options;
  if (filePath) {
    process.send?.({ type: "VALUE_CHANGE", path: filePath });
  }
});

const quiet = process.env.ORIGAMI_QUIET === "1";

// Get a handle to the tree produced by evaluating the expression
const treeHandle = await handleToEvaluatedExpression(expression, parent);

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

// Closing state
let closing = false;
let serverClosed = false;

function beginClose() {
  if (closing) {
    return;
  }

  closing = true;

  // Stop accepting new connections.
  server.close(() => {
    serverClosed = true;
    maybeFinishClose();
  });

  // Stop watching files
  projectRoot.unwatch();

  // Give in-flight requests a moment, then force-close remaining sockets.
  const GRACE_MS = 1200;
  setTimeout(() => {
    for (const socket of sockets) {
      // This will also abort any in-flight requests on that socket if still active.
      socket.destroy();
    }
    // socket "close" events will shrink the set; check again soon.
    setTimeout(maybeFinishClose, 50).unref();
  }, GRACE_MS).unref();

  // Absolute last resort: don’t hang forever.
  const HARD_MS = 3000;
  setTimeout(() => process.exit(0), HARD_MS).unref();
}

async function handleToEvaluatedExpression(expression, parent) {
  const handle = Object.assign(new AsyncMap(), {
    async get(key) {
      const tree = await this.getTree();
      return tree.get(key);
    },

    async getTree() {
      const tree = await systemCache.getOrInsertComputedAsync(
        "_expression",
        async () =>
          expressionTree({
            expression,
            parent,
          }),
      );
      return tree;
    },

    async keys() {
      const tree = await this.getTree();
      return tree.keys();
    },
  });

  // Trigger initial expression evaluation but don't wait for it. This lets some
  // evaluation happen while the user launches/refreshes their browser.
  handle.getTree();

  return handle;
}

function maybeFinishClose() {
  if (!closing) return;
  if (serverClosed && sockets.size === 0) {
    process.send?.({ type: "CLOSED" });
    process.exit(0);
  }
}

// Close when instructed by parent, or if parent dies.
process.on("message", async (/** @type {any} */ message) => {
  if (message?.type === "CLOSE") {
    beginClose();
  }
});
process.on("SIGTERM", beginClose);
process.on("SIGINT", beginClose);

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
