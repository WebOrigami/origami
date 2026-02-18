import { OrigamiFileMap } from "@weborigami/language";
import { fork } from "node:child_process";
import http from "node:http";

const PUBLIC_HOST = "127.0.0.1";
const PUBLIC_PORT = 5000;

// Module that loads the server in the child process
const childModuleUrl = new URL("./debugChild.js", import.meta.url);

// The active child process and port
/** @typedef {import("node:child_process").ChildProcess} ChildProcess */
/** @typedef {{ process: ChildProcess, port: number | null }} ChildInfo */
/** @type {ChildInfo | null} */
let activeChild = null;

// The most recently started child (may not be ready yet)
/** @type {ChildInfo | null} */
let pendingChild = null;

/**
 * Given an Origami function, determine the runtime state's parent container,
 * then start a new debug server with that parent as the root of the resource
 * tree.
 *
 * @param {import("@weborigami/language").AnnotatedCode} code
 * @param {import("@weborigami/language").RuntimeState} state
 */
export default async function debug2(code, state) {
  if (!(code instanceof Array) || arguments.length < 2) {
    throw new TypeError(
      "Dev.debug2 expects an expression to evaluate: `debug2 <expression>`",
    );
  }
  const { parent } = state;
  // @ts-ignore
  const parentPath = parent?.path;
  if (parentPath === undefined) {
    throw new Error("Dev.debug2 couldn't work out the parent path.");
  }

  const serverOptions = {
    expression: code.source,
    parent: parentPath,
  };

  const tree = new OrigamiFileMap(parentPath);
  tree.watch();
  tree.addEventListener?.("change", () => {
    console.log("File change detected, restarting child server…");
    startChild(serverOptions);
  });

  // ---- Public server
  const publicServer = http.createServer(proxyRequest);
  publicServer.listen(PUBLIC_PORT, PUBLIC_HOST, () => {
    startChild(serverOptions);
    console.log(
      `Server running at http://localhost:${PUBLIC_PORT}. Press Ctrl+C to stop.`,
    );
  });
}
debug2.needsState = true;
debug2.unevaluatedArgs = true;

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
      response.writeHead(
        upstreamResponse.statusCode ?? 502,
        upstreamResponse.statusMessage,
        upstreamResponse.headers,
      );
      upstreamResponse.pipe(response);
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

/**
 * Start a new child process.
 *
 * This will be a pending process until it sends a READY message, at which point
 * it becomes active and any previous active child is drained and stopped.
 */
function startChild(serverOptions) {
  const { expression, parent } = serverOptions;

  // Start the child process, passing parent path via an environment variable.
  /** @type {ChildProcess} */
  let childProcess;
  try {
    childProcess = fork(childModuleUrl, [], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      env: {
        ...process.env,
        ORIGAMI_EXPRESSION: expression,
        ORIGAMI_PARENT: parent,
      },
    });
  } catch (error) {
    throw new Error("Dev.debug2: failed to start child server:", {
      cause: error,
    });
  }

  // This becomes the pending child immediately
  pendingChild = { process: childProcess, port: null };

  // Listen for messages from the child about its status
  childProcess.on("message", (/** @type {any} */ message) => {
    if (!message || typeof message !== "object") {
      return;
    }

    if (message.type === "READY" && typeof message.port === "number") {
      // Only promote to active if this is still the pending child
      if (pendingChild?.process === childProcess) {
        const previousChild = activeChild;

        activeChild = pendingChild;
        pendingChild.port = message.port;
        pendingChild = null;

        // Drain previous child in background (don't wait)
        if (previousChild?.process && previousChild.process !== childProcess) {
          drainAndStopChild(previousChild.process).catch((err) =>
            console.error("[drain]", err),
          );
        }
      } else {
        // This child was superseded by a newer one, kill it
        console.log("Child process superseded by newer one, killing it...");
        childProcess.kill("SIGTERM");
      }
    }

    if (message.type === "FATAL") {
      // Child couldn't start (import error, etc.)
      // Keep previous active child if any; otherwise we'll serve 500/503.
      console.error("[child fatal]", message.error ?? message);
      if (pendingChild?.process === childProcess) {
        pendingChild = null;
      }
    }
  });

  childProcess.on("exit", (code, signal) => {
    if (activeChild?.process === childProcess) {
      // Active child died unexpectedly.
      activeChild = null;
    }
    if (pendingChild?.process === childProcess) {
      pendingChild = null;
    }
  });
}
