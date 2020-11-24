import { graphServer } from "@explorablegraph/graph";
import http from "http";
import graph from "./7.js";

const port = process.env.PORT || 5000;

const server = graphServer(graph);
http.createServer(server).listen(port);
console.log(`Server running at http://localhost:${port}`);
