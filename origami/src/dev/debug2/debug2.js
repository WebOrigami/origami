import { OrigamiFileMap } from "@weborigami/language";
import { fork } from "node:child_process";
import http from "node:http";

const PUBLIC_HOST = "127.0.0.1";
const PUBLIC_PORT = 5000;

// Module that loads the child server
const childModuleUrl = new URL("./debugChild.js", import.meta.url);

let active = null; // { child, port }
let childPromise = null; // Promise to start child

/**
 * Given an Origami function, determine the runtime state's parent container,
 * then start a new debug server with that parent as the root of the resource
 * tree.
 *
 * @param {import("@weborigami/language").RuntimeState} state
 */
export default async function debug2(state) {
  const { parent } = state;
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
 * Give a previously-active child a chance to finish any in-flight requests
 * before we kill it.
 */
async function drainAndStopChild(previous) {
  if (!previous?.child || previous.child.killed) {
    return;
  }

  const child = previous.child;

  // Ask it to drain first.
  try {
    child.send({ type: "DRAIN" });
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
      child.off("message", onMessage);
      child.off("exit", onExit);
      done();
    }

    child.on("message", onMessage);
    child.on("exit", onExit);
  });

  // Give it a short grace window to finish in-flight work.
  const GRACE_MS = 1500;
  await Promise.race([
    drained,
    new Promise((r) => setTimeout(r, GRACE_MS).unref()),
  ]);

  if (!child.killed) {
    child.kill("SIGTERM");
  }

  // Final escalation.
  setTimeout(() => {
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }, GRACE_MS).unref();
}

/**
 * Proxy incoming requests to the active child server, or return a 503 if not
 * ready.
 *
 * @param {Request} request
 * @param {Response} response
 */
function proxyRequest(request, response) {
  if (!active) {
    response.statusCode = 503;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end("Dev server is starting…\n");
    return;
  }

  const { port } = active;

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
  childPromise ??= new Promise((resolve, reject) => {
    // Start the child process, passing parent path via an environment variable.
    const child = fork(childModuleUrl, [], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      env: {
        ...process.env,
        ORIGAMI_PARENT: serverOptions.parent,
      },
    });

    let receivedChildReady = false;

    child.on("message", (/** @type {any} */ message) => {
      if (!message || typeof message !== "object") {
        return;
      }

      if (message.type === "READY" && typeof message.port === "number") {
        const previous = active;
        active = { child, port: message.port };

        // Drain previous child in background.
        if (previous?.child && previous.child !== child) {
          drainAndStopChild(previous).catch((err) =>
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

    child.on("exit", (code, signal) => {
      if (!receivedChildReady) {
        childPromise = null;
        reject(
          new Error(
            `Child exited before READY (code=${code}, signal=${signal})`,
          ),
        );
      } else if (active?.child === child) {
        // Active child died unexpectedly.
        active = null;
      }
    });
  });

  return childPromise;
}
