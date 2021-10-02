import http from "http";
import process from "process";
import { requestListener } from "../../server/server.js";
import app from "./app.js";
import watch from "./watch.js";

const defaultPort = process.env.PORT || 5000;

export default async function serve(graph, port = defaultPort) {
  if (graph === undefined) {
    graph = await watch(await app());
  }
  http.createServer(requestListener(graph)).listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

serve.usage = `serve(graph, [port])\tStart a local web server for the graph`;
