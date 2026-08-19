import { args } from "@weborigami/async-tree";
import http from "node:http";
import process from "node:process";
import { isTransformApplied, transformObject } from "../common/utilities.js";
import { requestListener } from "../server/server.js";
import ExplorableSiteTransform from "./ExplorableSiteTransform.js";
import findOpenPort from "./findOpenPort.js";

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
