import http from "http";
import { loadGraphFromArgument } from "../cliShared.js";
import graphServer from "../graphServer.js";

const defaultPort = process.env.PORT || 5000;

export default async function serve(graphArg, port = defaultPort) {
  if (!graphArg) {
    console.error(`usage:\n${serve.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const server = graphServer(graph);
  http.createServer(server).listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

serve.usage = `graph serve <graph> [port]       Start a local web server for the graph`;
