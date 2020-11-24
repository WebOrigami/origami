import http from "http";
import { requestListener } from "../src/webserver.js";
import sample from "./sample.js";

const port = 5000;
http.createServer(requestListener(sample)).listen(port);
console.log(`Server running at http://localhost:${port}`);
