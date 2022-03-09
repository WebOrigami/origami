import http from "http";
import process from "process";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { requestListener } from "../server/server.js";
import virtual from "./virtual.js";
import watch from "./watch.js";

const defaultPort = process.env.PORT || 5000;

export default async function serve(variant, port = defaultPort) {
  const graph = variant
    ? ExplorableGraph.from(variant)
    : // @ts-ignore
      await watch.call(this, await virtual.call(this));
  http.createServer(requestListener(graph)).listen(port, undefined, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

serve.usage = `serve <graph>, [port]\tStart a local web server for the graph`;
serve.documentation = "https://explorablegraph.org/cli/builtins.html#serve";
