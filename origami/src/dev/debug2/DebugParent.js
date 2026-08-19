import { fork } from "node:child_process";
import { EventEmitter } from "node:events";
import http from "node:http";
import path from "node:path";
import findOpenPort from "../findOpenPort.js";

// Module that loads the server in the child process
const childModuleUrl = new URL("./debugChild.js", import.meta.url);

/**
 * An Origami debug server parent session.
 *
 * The session's `start` method starts a child server that evaluates the given
 * expression with the given parent path. This arrangement ensures the
 * expression is evaluated in a clean Node context (not polluted by previous
 * evaluations). The parent server proxies requests to the child server.
 *
 * The `emitter` property is an EventEmitter that emits "error" events when the
 * child server encounters an Origami error while handling a request.
 *
 * @param {Object} options
 * @param {string} options.expression
 * @param {string} options.parentPath
 * @param {number} [options.port]
 * @param {boolean} [options.quiet]
 */
export default class DebugParent extends EventEmitter {
  /**
   * @param {Object} options
   * @param {string} options.expression - the Origami expression to evaluate in
   *   the child process
   * @param {string} options.parentPath - the path to the parent tree used for
   * evaluation
   * @param {number} [options.port]
   * @param {boolean} [options.quiet]
   */
  constructor(options) {
    super();

    const { expression, parentPath, port, quiet } = options;
    if (expression === undefined) {
      throw new Error("A debugger must have an expression to evaluate.");
    }
    if (parentPath === undefined) {
      throw new Error("A debugger must have a parent path.");
    }
    this.expression = expression;
    this.parentPath = parentPath;
    this.port = port;
    this.quiet = quiet ?? false;

    /** @type {import("node:http").Server | null} */
    this.parentServer = null;
    this.origin = "";

    /** @type {ChildInfo | null} */
    this.activeChild = null;

    /** @type {ChildInfo | null} */
    this.pendingChild = null;

    this.closed = false;
  }

  async close() {
    if (this.closed) {
      return;
    }
    this.closed = true;

    // Stop accepting new connections and force-close any keep-alive
    // connections so the close callback fires promptly.
    const server = this.parentServer;
    this.parentServer = null;
    if (server) {
      const closeServer = new Promise((resolve) => server.close(resolve));
      server.closeAllConnections();
      await closeServer;
    }

    // Drain and stop any children concurrently.
    const children = [
      this.pendingChild?.process,
      this.activeChild?.process,
    ].filter(
      /** @returns {child is ChildProcess} */
      (child) => child !== undefined,
    );
    this.pendingChild = null;
    this.activeChild = null;
    await Promise.all(children.map(drainAndStopChild));

    this.emit("close");
    this.removeAllListeners();
  }

  async onFileChange(filePath) {
    if (isJavaScriptFile(filePath)) {
      // Need to restart the child process.
      console.log("JavaScript file changed, restarting server...");
      await this.restart();
    } else if (filePath.endsWith("/config.ori")) {
      console.log("Origami configuration file changed, restarting server...");
      await this.restart();
    }

    // Let event listeners know about the file change.
    this.emit("change", { filePath });
  }

  /**
   * Proxy incoming requests to the active child server, or return a 503 if
   * not ready.
   *
   * @param {import("node:http").IncomingMessage} request
   * @param {import("node:http").ServerResponse} response
   */
  proxyRequest(request, response) {
    if (!request || !response) {
      return;
    }

    if (!this.activeChild) {
      response.statusCode = 503;
      response.setHeader("content-type", "text/plain; charset=utf-8");
      response.end("Dev server is starting...\n");
      return;
    }

    const childPort = this.activeChild.port;

    // Minimal hop-by-hop header stripping.
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
        host: "localhost",
        port: childPort,
        method: request.method,
        path: request.url,
        headers,
      },
      (upstreamResponse) => {
        const { statusCode } = upstreamResponse;
        const responseHeaders = { ...upstreamResponse.headers };

        // Special case for viewing YAML files in the debugger. By default
        // Chromium will download YAML files instead of rendering them. To
        // override that, we switch the content type to "text/plain".
        const contentTypeHeader = responseHeaders["content-type"];
        const contentType = Array.isArray(contentTypeHeader)
          ? contentTypeHeader[0]
          : contentTypeHeader;
        if (
          typeof contentType === "string" &&
          contentType.trim().toLowerCase() === "application/yaml"
        ) {
          responseHeaders["content-type"] = "text/plain; charset=utf-8";
        }

        response.writeHead(
          statusCode ?? 502,
          upstreamResponse.statusMessage,
          responseHeaders,
        );
        upstreamResponse.pipe(response);

        // Let caller know about Origami error messages.
        if (statusCode !== undefined && statusCode >= 500) {
          const rawHeader = upstreamResponse.headers["x-error-details"];
          const raw = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
          const message = raw ? decodeURIComponent(raw) : undefined;
          if (message) {
            this.emit("origami-error", message);
          }
        }
      },
    );

    upstreamRequest.on("error", (err) => {
      // Stop piping the request body.
      request.unpipe(upstreamRequest);
      upstreamRequest.destroy();

      // Only send error response if headers haven't been sent yet.
      if (!response.headersSent) {
        response.statusCode = 502;
        response.setHeader("content-type", "text/plain; charset=utf-8");
        response.end(`Upstream error: ${err.message}\n`);
      } else {
        // Headers already sent, can't send error message - just close.
        response.destroy();
      }
    });

    // Also handle errors on the incoming request.
    request.on("error", () => {
      upstreamRequest.destroy();
    });

    request.pipe(upstreamRequest);
  }

  async restart() {
    if (this.closed) {
      return;
    }
    await this.startChild();
  }

  /**
   * Start the parent session, which also starts the child process and waits for
   * it to be ready.
   */
  async start() {
    this.port ??= await findOpenPort();
    this.origin = `http://localhost:${this.port}`;

    this.parentServer = http.createServer((request, response) =>
      this.proxyRequest(request, response),
    );
    const server = this.parentServer;
    await /** @type {Promise<void>} */ (
      new Promise((resolve) =>
        server.listen(this.port, undefined, () => resolve()),
      )
    );

    await this.startChild();

    // console.log(`Debug parent server running at ${this.origin}.`);
  }

  /**
   * Start a new child process.
   *
   * This will be a pending process until it sends a READY message, at which
   * point it becomes active and any previous active child is drained/stopped.
   */
  startChild() {
    // Start child process, passing parent path via environment variable.
    /** @type {ChildProcess} */
    let childProcess;
    try {
      childProcess = fork(childModuleUrl, [], {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
        env: {
          ...process.env,
          // When launched in Projector, tell Electron not to start a new app window.
          ELECTRON_RUN_AS_NODE: "1",
          ORIGAMI_EXPRESSION: this.expression,
          ORIGAMI_PARENT_PATH: this.parentPath,
          ORIGAMI_QUIET: this.quiet ? "1" : "0",
        },
      });
    } catch (error) {
      throw new Error("Dev.debug2: failed to start child server:", {
        cause: error,
      });
    }

    // This becomes pending immediately.
    this.pendingChild = { process: childProcess, port: null };

    // Resolve on READY, reject on FATAL or unexpected pre-ready exit.
    return /** @type {Promise<void>} */ (
      new Promise((resolve, reject) => {
        childProcess.on("message", (/** @type {any} */ message) => {
          if (!message || typeof message !== "object") {
            return;
          } else if (
            message.type === "READY" &&
            typeof message.port === "number"
          ) {
            // Only promote if this is still the pending child.
            if (this.pendingChild?.process === childProcess) {
              const previousChild = this.activeChild;

              this.activeChild = this.pendingChild;
              this.pendingChild.port = message.port;
              this.pendingChild = null;

              // Drain previous child in background.
              if (
                previousChild?.process &&
                previousChild.process !== childProcess
              ) {
                drainAndStopChild(previousChild.process).catch((err) =>
                  console.error("[drain]", err),
                );
              }

              this.emit("ready", { origin: this.origin });
              resolve();
            } else {
              // Child was superseded by a newer one.
              childProcess.kill("SIGTERM");
            }
          } else if (
            message.type === "VALUE_CHANGE" &&
            typeof message.path === "string"
          ) {
            // Avoid awaiting so file change handling doesn't block IPC.
            this.onFileChange(message.path);
          } else if (message.type === "FATAL") {
            // Child couldn't start (import error, etc).
            console.error("[child fatal]", message.error ?? message);
            if (this.pendingChild?.process === childProcess) {
              this.pendingChild = null;
            }
            reject(new Error(message.error ?? "Child server failed to start"));
          }
        });

        childProcess.on("exit", (code, signal) => {
          if (this.activeChild?.process === childProcess) {
            this.activeChild = null;
          }
          if (this.pendingChild?.process === childProcess) {
            this.pendingChild = null;
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

  // Ask it to close first.
  try {
    childProcess.send({ type: "CLOSE" });
  } catch {
    // ignore
  }

  const closed = new Promise((resolve) => {
    const onMessage = (msg) => {
      if (msg && typeof msg === "object" && msg.type === "CLOSED") {
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
    closed,
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

/** @typedef {import("node:child_process").ChildProcess} ChildProcess */
/** @typedef {{ process: ChildProcess, port: number | null }} ChildInfo */
/** @typedef {EventEmitter & { close: () => Promise<void>, origin: string, restart: () => Promise<void> }} DebugParentHandle */

function isJavaScriptFile(filePath) {
  const extname = path.extname(filePath).toLowerCase();
  const jsExtensions = [".cjs", ".js", ".mjs", ".ts"];
  return jsExtensions.includes(extname);
}
