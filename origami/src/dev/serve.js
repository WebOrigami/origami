import { Tree } from "@weborigami/async-tree";
import http from "node:http";
import { createServer } from "node:net";
import process from "node:process";
import ExplorableSiteTransform from "../common/ExplorableSiteTransform.js";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import { requestListener } from "../server/server.js";
import debug from "./debug.js";
import watch from "./watch.js";

const defaultPort = 5000;

/**
 * Start a local web server for the indicated tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {number} [port]
 * @this {AsyncTree|null}
 */
export default async function serve(treelike, port) {
  assertTreeIsDefined(this, "dev:serve");
  let tree;
  if (treelike) {
    tree = Tree.from(treelike, { parent: this });
    if (!isTransformApplied(ExplorableSiteTransform, tree)) {
      tree = transformObject(ExplorableSiteTransform, tree);
    }
  } else {
    // By default, watch the default tree and add default pages.
    const withDefaults = await debug.call(this);
    tree = await watch.call(this, withDefaults);
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
      `Server running at http://localhost:${port}. Press Ctrl+C to stop.`
    );
  });
}
serve.description = "serve(tree, port) - Start a web server for the tree";

// Return the first open port number on or after the given port number.
// From https://gist.github.com/mikeal/1840641?permalink_comment_id=2896667#gistcomment-2896667
function findOpenPort(port) {
  const server = createServer();
  return new Promise((resolve, reject) =>
    server
      .on("error", (/** @type {any} */ error) =>
        error.code === "EADDRINUSE" ? server.listen(++port) : reject(error)
      )
      .on("listening", () => server.close(() => resolve(port)))
      .listen(port)
  );
}
