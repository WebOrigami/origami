import { args } from "@weborigami/async-tree";
import http from "node:http";
import { createServer } from "node:net";
import process from "node:process";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import { requestListener } from "../server/server.js";
import ExplorableSiteTransform from "./ExplorableSiteTransform.js";

const defaultPort = 5000;

/**
 * Start a local web server for the indicated tree.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {number} [port]
 */
export default async function serve(maplike, port) {
  let tree = await args.map(maplike, "Dev.serve");
  port =
    port !== undefined
      ? args.number(port, "Dev.serve", { position: 2 })
      : undefined;

  if (!isTransformApplied(ExplorableSiteTransform, tree)) {
    tree = transformObject(ExplorableSiteTransform, tree);
  }

  if (port === undefined) {
    if (process.env.PORT) {
      // Use the port specified in the environment.
      port = parseInt(process.env.PORT);
    } else {
      // Find an open port.
      port = await findOpenPort(defaultPort);
    }
  }

  // @ts-ignore
  http.createServer(requestListener(tree)).listen(port, undefined, () => {
    console.log(
      `Server running at http://localhost:${port}. Press Ctrl+C to stop.`,
    );
  });
}

// Return the first open port number on or after the given port number.
// From https://gist.github.com/mikeal/1840641?permalink_comment_id=2896667#gistcomment-2896667
function findOpenPort(port) {
  const server = createServer();
  return new Promise((resolve, reject) =>
    server
      .on("error", (/** @type {any} */ error) =>
        error.code === "EADDRINUSE" ? server.listen(++port) : reject(error),
      )
      .on("listening", () => server.close(() => resolve(port)))
      .listen(port),
  );
}
