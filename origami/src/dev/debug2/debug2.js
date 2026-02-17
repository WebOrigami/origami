import { OrigamiFileMap } from "@weborigami/language";
import { fork } from "node:child_process";
import http from "node:http";

const PUBLIC_HOST = "127.0.0.1";
const PUBLIC_PORT = 5000;

// Module that loads the server in the child process
const childModuleUrl = new URL("./debugChild.js", import.meta.url);

// The active child process and port
/** @typedef {import("node:child_process").ChildProcess} ChildProcess */
/** @type {{ process: ChildProcess, port: number } | null} */
let activeChild = null;

// Promise to start child
let childPromise = null;

/**
 * Given an Origami function, determine the runtime state's parent container,
 * then start a new debug server with that parent as the root of the resource
 * tree.
 *
 * @param {import("@weborigami/language").RuntimeState} state
 */
export default async function debug2(state) {
  const { parent } = state;
  // @ts-ignore
  const parentPath = parent?.path;
  if (parentPath === undefined) {
    throw new Error("Dev.debug2 couldn't work out the parent path.");
  }
  const serverOptions = {
    parent: parentPath,
  };

  const tree = new OrigamiFileMap(parentPath);
  tree.watch();
  tree.addEventListener?.("change", async () => {
    console.log("File change detected, restarting child server…");
    await restartChild(serverOptions);
  });

  // ---- Public server
  const publicServer = http.createServer(proxyRequest);
  publicServer.listen(PUBLIC_PORT, PUBLIC_HOST, async () => {
    await restartChild(serverOptions);
    console.log(
      `Server running at http://localhost:${PUBLIC_PORT}. Press Ctrl+C to stop.`,
    );
  });
}
debug2.needsState = true;

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
    // Child may be restarting; return a friendly 502.
    response.statusCode = 502;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end(`Upstream error: ${err.message}\n`);
  });

  request.pipe(upstreamRequest);
}

async function restartChild(serverOptions) {
  try {
    await startChild(serverOptions);
  } catch (error) {
    console.error("Dev.debug2: failed to start child server:", error);
  }
}

function startChild(serverOptions) {
  childPromise ??= new Promise(
    (
      /** @type {(value?: void | PromiseLike<void>) => void} */ resolve,
      /** @type {(reason?: any) => void} */ reject,
    ) => {
      // Start the child process, passing parent path via an environment variable.
      const childProcess = fork(childModuleUrl, [], {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
        env: {
          ...process.env,
          ORIGAMI_PARENT: serverOptions.parent,
        },
      });

      let receivedChildReady = false;

      childProcess.on("message", (/** @type {any} */ message) => {
        if (!message || typeof message !== "object") {
          return;
        }

        if (message.type === "READY" && typeof message.port === "number") {
          // Make this child the active one
          const previousChild = activeChild;
          activeChild = { process: childProcess, port: message.port };

          // Drain previous child in background (don't wait)
          if (
            previousChild?.process &&
            previousChild.process !== childProcess
          ) {
            drainAndStopChild(previousChild.process).catch((err) =>
              console.error("[drain]", err),
            );
          }

          receivedChildReady = true;
          childPromise = null;
          resolve();
        }

        if (message.type === "FATAL") {
          // Child couldn't start (import error, etc.)
          // Keep previous active child if any; otherwise we'll serve 500/503.
          console.error("[child fatal]", message.error ?? message);
        }
      });

      childProcess.on("exit", (code, signal) => {
        if (!receivedChildReady) {
          childPromise = null;
          reject(
            new Error(
              `Child exited before READY (code=${code}, signal=${signal})`,
            ),
          );
        } else if (activeChild?.process === childProcess) {
          // Active child died unexpectedly.
          activeChild = null;
        }
      });
    },
  );

  return childPromise;
}
