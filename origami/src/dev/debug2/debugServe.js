import { OrigamiFileMap } from "@weborigami/language";
import http from "node:http";
import process from "node:process";
import { requestListener } from "../../server/server.js";

// We wait for the parent process to send the parent path and the expression to
// evaluate.
process.on("message", async (/** @type {any} */ message) => {
  const { parent, port } = message;
  if (typeof parent !== "string") {
    console.error(
      "Dev.debug2: Unable to start debug server: parent path not provided.",
    );
    return;
  }
  if (typeof port !== "number") {
    console.error(
      "Dev.debug2: Unable to start debug server: port not provided.",
    );
    return;
  }

  const tree = new OrigamiFileMap(parent);

  http.createServer(requestListener(tree)).listen(port, undefined, () => {
    console.log(
      `Server running at http://localhost:${port}. Press Ctrl+C to stop.`,
    );
  });
});
