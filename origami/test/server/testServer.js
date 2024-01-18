// Manual server test runner.

import http from "node:http";
import { requestListener } from "../../src/server/server.js";
import sampleSite from "./sampleSite.js";

export default function () {
  const port = 5000;
  http.createServer(requestListener(sampleSite)).listen(port);
  console.log(`Server running at http://localhost:${port}`);
}
