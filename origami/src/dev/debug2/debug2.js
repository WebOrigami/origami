import { OrigamiFileMap } from "@weborigami/language";
import { fork } from "node:child_process";

let restarting = false;
let serverController = null;
let serverProcess = null;

/**
 * Given an Origami function, extract the expression used to run it, then start
 * a new debug server running the result of that expression as the tree to
 * debug.
 *
 * @param {Function} fn
 * @param {import("@weborigami/language").RuntimeState} state
 */
export default async function debug2(state) {
  const { parent } = state;
  const parentPath = parent?.path;
  if (parentPath === undefined) {
    throw new Error("Dev.debug2 couldn't work out the parent path.");
  }
  const port = 5000;
  const serverOptions = {
    parent: parentPath,
    port,
  };

  const tree = new OrigamiFileMap(parentPath);
  tree.watch();
  tree.addEventListener?.("change", async () => {
    if (!restarting) {
      restarting = true;
      await restartServer(serverOptions);
      restarting = false;
    }
  });

  await startServer(serverOptions);
}
debug2.needsState = true;

async function restartServer(options) {}

async function startServer(options) {
  serverController = new AbortController();
  const { signal } = serverController;
  const url = new URL("debugServe.js", import.meta.url);
  serverProcess = fork(url, ["child"], { signal });

  // child.on("message", (response) => {
  //   const buffer =
  //     response.type === "Buffer" ? Uint8Array.from(response.data) : response;
  //   const text = toString(buffer);
  //   console.log("Response from child:", text);

  //   serverController.abort(); // Stops the child process
  // });

  serverProcess.on("error", (err) => {
    // This will be called with err being an AbortError if the controller aborts
  });

  serverProcess.send(options);
}

async function stopServer() {
  if (serverController) {
    serverController.abort();
    serverController = null;
  }
}
