/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import http from "node:http";
import { createServer } from "node:net";
import process from "node:process";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import { requestListener } from "../server/server.js";
import debug from "./@debug.js";
import watch from "./@watch.js";

const defaultPort = 5000;

/**
 * Start a local web server for the indicated graph.
 *
 * @param {GraphVariant} variant
 * @param {number} [port]
 * @this {AsyncDictionary|null}
 */
export default async function serve(variant, port) {
  assertScopeIsDefined(this);
  let graph;
  if (variant) {
    graph = GraphHelpers.from(variant);
  } else {
    // By default, watch the default graph and add default pages.
    const withDefaults = await debug.call(this);
    graph = await watch.call(this, withDefaults);
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
  http.createServer(requestListener(graph)).listen(port, undefined, () => {
    console.log(
      `Server running at http://localhost:${port}. Press Ctrl+C to stop.`
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
        error.code === "EADDRINUSE" ? server.listen(++port) : reject(error)
      )
      .on("listening", () => server.close(() => resolve(port)))
      .listen(port)
  );
}

serve.usage = `@serve <graph>, [port]\tStart a web server for the graph`;
serve.documentation = "https://graphorigami.org/language/@serve.html";
