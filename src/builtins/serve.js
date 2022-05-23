import http from "http";
import { createServer } from "net";
import process from "process";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { requestListener } from "../server/server.js";
import virtual from "./virtual.js";
// import watch from "./watch.js";

const defaultPort = 5000;

/**
 * Start a local web server for the indicated graph.
 *
 * @param {GraphVariant} variant
 * @param {number} [port]
 */
export default async function serve(variant, port) {
  const graph = variant
    ? ExplorableGraph.from(variant)
    : // @ts-ignore
      // await watch.call(this, await virtual.call(this));
      await await virtual.call(this);

  if (port === undefined) {
    if (process.env.PORT) {
      // Use the port specified in the environment.
      port = parseInt(process.env.PORT);
    } else {
      // Find an open port.
      port = await findOpenPort(defaultPort);
    }
  }

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

serve.usage = `serve <graph>, [port]\tStart a local web server for the graph`;
serve.documentation = "https://explorablegraph.org/cli/builtins.html#serve";
