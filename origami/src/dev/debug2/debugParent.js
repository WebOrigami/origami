import { fork } from "node:child_process";
import { EventEmitter } from "node:events";
import http from "node:http";
import { findOpenPort } from "../../common/findOpenPort.js";

const PUBLIC_HOST = "127.0.0.1";

// Module that loads the server in the child process
const childModuleUrl = new URL("./debugChild.js", import.meta.url);

// The public-facing server that proxies to the child process
let publicServer;
let publicOrigin;

// The active child process and port
/** @typedef {import("node:child_process").ChildProcess} ChildProcess */
/** @typedef {{ process: ChildProcess, port: number | null }} ChildInfo */
/** @type {ChildInfo | null} */
let activeChild = null;

// The most recently started child (may not be ready yet)
/** @type {ChildInfo | null} */
let pendingChild = null;

// Used to communicate errors to caller
let emitter = null;

/**
 * Start a new debug parent server for the given Origami expression and runtime
 * state.
 *
 * This function will start a child server that evaluates the given expression
 * with the given parent path. This arrangement ensures the expression is
 * evaluated in a clean Node context (not polluted by previous evaluations). The
 * parent server proxies requests to the child server.
 *
 * The debug parent monitors the parent tree for changes, and restarts the child
 * whenever files in the parent tree change.
 *
 * Supported `options`:
 * - `debugFilesPath`: path to resources that will be added to the served tree
 * - `enableUnsafeEval`: if true, enables the `!eval` debug command in the child
 *   process; default is false
 * - `expression` (required): the Origami expression to evaluate in the child
 *   process
 * - `parentPath` (required): the path to the parent tree used for evaluation
 *
 * The returned `emitter` is an EventEmitter that emits "error" events when the
 * child server encounters an Origami error while handling a request.
 *
 * @param {Object} options
 * @param {string} [options.debugFilesPath]
 * @param {boolean} [options.enableUnsafeEval]
 * @param {string} options.expression
 * @param {string} options.parentPath
 * @param {number} [options.port]
 * @param {boolean} [options.quiet]
 */
export default async function debugParent(options) {
  const { parentPath } = options;
  if (parentPath === undefined) {
    throw new Error("Debugger couldn't work out the parent path.");
  }

  const port = options.port ?? (await findOpenPort());
  publicOrigin = `http://${PUBLIC_HOST}:${port}`;

  publicServer = http.createServer(proxyRequest);
  await new Promise((resolve) =>
    publicServer.listen(port, PUBLIC_HOST, resolve),
  );
  await startChild(options);

  emitter = Object.assign(new EventEmitter(), {
    close,
    origin: publicOrigin,
    reevaluate,
    restart: () => startChild(options),
  });
  return emitter;
}

/**
 * Gracefully stop the parent server and any active child server, giving the
 * child a chance to finish any in-flight requests before exiting.
 */
async function close() {
  // Stop accepting new connections and force-close any keep-alive connections
  // so the close callback fires promptly.
  const closed = new Promise((resolve) => publicServer.close(resolve));
  publicServer.closeAllConnections();
  await closed;
  publicServer = null;

  // Drain and stop any children concurrently
  const children = [pendingChild?.process, activeChild?.process].filter(
    /** @returns {child is ChildProcess} */
    (child) => child !== undefined,
  );
  pendingChild = null;
  activeChild = null;
  await Promise.all(children.map(drainAndStopChild));

  emitter.emit("close");
  emitter.removeAllListeners();
  emitter = null;
}

/**
 * Give a child process a chance to finish any in-flight requests before we kill
 * it.
 *
 * @param {ChildProcess} childProcess
 */
async function drainAndStopChild(childProcess) {
  if (childProcess.killed) {
    return;
  }

  // Ask it to drain first.
  try {
    childProcess.send({ type: "DRAIN" });
  } catch {
    // ignore
  }

  const drained = new Promise((resolve) => {
    const onMessage = (msg) => {
      if (msg && typeof msg === "object" && msg.type === "DRAINED") {
        cleanup(resolve);
      }
    };
    const onExit = () => cleanup(resolve);

    function cleanup(done) {
      childProcess.off("message", onMessage);
      childProcess.off("exit", onExit);
      done();
    }

    childProcess.on("message", onMessage);
    childProcess.on("exit", onExit);
  });

  // Give it a short grace window to finish in-flight work.
  const GRACE_MS = 1500;
  await Promise.race([
    drained,
    new Promise((r) => setTimeout(r, GRACE_MS).unref()),
  ]);

  if (!childProcess.killed) {
    childProcess.kill("SIGTERM");
  }

  // Final escalation.
  setTimeout(() => {
    // Child should have exited by now, but if not kill it
    if (!childProcess.killed) {
      childProcess.kill("SIGKILL");
    }
  }, GRACE_MS).unref();
}

/**
 * Proxy incoming requests to the active child server, or return a 503 if not
 * ready.
 *
 * @param {import("node:http").IncomingMessage} request
 * @param {import("node:http").ServerResponse} response
 */
function proxyRequest(request, response) {
  if (!activeChild) {
    response.statusCode = 503;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end("Dev server is starting…\n");
    return;
  }

  const { port } = activeChild;

  // Minimal hop-by-hop header stripping
  const headers = { ...request.headers };
  delete headers.connection;
  delete headers["proxy-connection"];
  delete headers["keep-alive"];
  delete headers.te;
  delete headers.trailer;
  delete headers["transfer-encoding"];
  delete headers.upgrade;

  const upstreamRequest = http.request(
    {
      host: PUBLIC_HOST,
      port,
      method: request.method,
      path: request.url,
      headers,
    },
    (upstreamResponse) => {
      const { statusCode } = upstreamResponse;
      response.writeHead(
        statusCode ?? 502,
        upstreamResponse.statusMessage,
        upstreamResponse.headers,
      );
      upstreamResponse.pipe(response);

      // Let caller know about the Origami error messages
      if (statusCode !== undefined && statusCode >= 500 && emitter) {
        const rawHeader = upstreamResponse.headers["x-error-details"];
        const raw = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
        const message = raw ? decodeURIComponent(raw) : undefined;
        if (message) {
          emitter.emit("origami-error", message);
        }
      }
    },
  );

  upstreamRequest.on("error", (err) => {
    // Stop piping the request body
    request.unpipe(upstreamRequest);
    upstreamRequest.destroy();

    // Only send error response if headers haven't been sent yet
    if (!response.headersSent) {
      response.statusCode = 502;
      response.setHeader("content-type", "text/plain; charset=utf-8");
      response.end(`Upstream error: ${err.message}\n`);
    } else {
      // Headers already sent, can't send error message - just close
      response.destroy();
    }
  });

  // Also handle errors on the incoming request
  request.on("error", () => {
    upstreamRequest.destroy();
  });

  request.pipe(upstreamRequest);
}

async function reevaluate() {
  if (!activeChild) {
    return;
  }

  const child = activeChild;

  // Wait for the next EVALUATED message from the child
  const evaluated = /** @type {Promise<void>} */ (
    new Promise((resolve) => {
      const onMessage = (/** @type {any} */ msg) => {
        if (msg && typeof msg === "object" && msg.type === "EVALUATED") {
          child.process.off("message", onMessage);
          resolve();
        }
      };
      child.process.on("message", onMessage);
    })
  );

  child.process.send({ type: "REEVALUATE" });
  await evaluated;
}

/**
 * Start a new child process.
 *
 * This will be a pending process until it sends a READY message, at which point
 * it becomes active and any previous active child is drained and stopped.
 */
function startChild(options) {
  const { expression, parentPath } = options;
  const debugFilesPath = options.debugFilesPath ?? "";
  const enableUnsafeEval = options.enableUnsafeEval ?? false;
  const quiet = options.quiet ?? false;

  // Start the child process, passing parent path via an environment variable.
  /** @type {ChildProcess} */
  let childProcess;
  try {
    childProcess = fork(childModuleUrl, [], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      env: {
        ...process.env,
        ORIGAMI_DEBUG_FILES_PATH: debugFilesPath,
        ORIGAMI_ENABLE_UNSAFE_EVAL: enableUnsafeEval ? "1" : "0",
        ORIGAMI_EXPRESSION: expression,
        ORIGAMI_PARENT_PATH: parentPath,
        ORIGAMI_QUIET: quiet ? "1" : "0",
      },
    });
  } catch (error) {
    throw new Error("Dev.debug2: failed to start child server:", {
      cause: error,
    });
  }

  // This becomes the pending child immediately
  pendingChild = { process: childProcess, port: null };

  // Returns a Promise that resolves when the child signals READY, or rejects
  // on FATAL or unexpected exit before ready.
  return /** @type {Promise<void>} */ (
    new Promise((resolve, reject) => {
      // Listen for messages from the child about its status
      childProcess.on("message", (/** @type {any} */ message) => {
        if (!message || typeof message !== "object") {
          return;
        } else if (
          message.type === "READY" &&
          typeof message.port === "number"
        ) {
          // Only promote to active if this is still the pending child
          if (pendingChild?.process === childProcess) {
            const previousChild = activeChild;

            activeChild = pendingChild;
            pendingChild.port = message.port;
            pendingChild = null;

            // Drain previous child in background (don't wait)
            if (
              previousChild?.process &&
              previousChild.process !== childProcess
            ) {
              drainAndStopChild(previousChild.process).catch((err) =>
                console.error("[drain]", err),
              );
            }

            if (emitter) {
              emitter.emit("ready", { origin: publicOrigin });
            }
            resolve();
          } else {
            // This child was superseded by a newer one, kill it
            // console.log("Child process superseded by newer one, killing it...");
            childProcess.kill("SIGTERM");
          }
        } else if (message.type === "EVALUATED") {
          // Let caller know child has reevaluated the expression (after a file change)
          if (emitter) {
            emitter.emit("evaluated");
          }
        } else if (message.type === "FATAL") {
          // Child couldn't start (import error, etc.)
          // Keep previous active child if any; otherwise we'll serve 500/503.
          console.error("[child fatal]", message.error ?? message);
          if (pendingChild?.process === childProcess) {
            pendingChild = null;
          }
          reject(new Error(message.error ?? "Child server failed to start"));
        }
      });

      childProcess.on("exit", (code, signal) => {
        if (activeChild?.process === childProcess) {
          // Active child died unexpectedly.
          activeChild = null;
        }
        if (pendingChild?.process === childProcess) {
          pendingChild = null;
          // Child died before it was ready. If child was ready and resolve()
          // was called, when the child exits, then reject() is a no-op.
          reject(
            new Error(
              `Child exited before ready (code=${code}, signal=${signal})`,
            ),
          );
        }
      });
    })
  );
}
