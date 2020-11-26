import { requestListener } from "@explorablegraph/webserver";
import http from "http";
import process from "process";
import { loadGraphFromArgument } from "../shared.js";

const defaultPort = process.env.PORT || 5000;

export default async function serve(graphArg, port = defaultPort) {
  if (!graphArg) {
    console.error(`usage:\n${serve.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  http.createServer(requestListener(graph)).listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

serve.usage = `eg serve <graph> [port]       Start a local web server for the graph`;
