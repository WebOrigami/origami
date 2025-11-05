import { toString } from "@weborigami/async-tree";
import { exec } from "node:child_process";

/**
 * Shell script file extension handler
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed) {
    const text = toString(packed);

    return new Promise((resolve, reject) => {
      const child = exec("sh", (error, stdout, stderr) => {
        if (error) {
          // Include stderr in the error for easier debugging
          error.stderr = stderr;
          reject(error);
          return;
        }
        resolve(stdout);
      });

      if (child?.stdin) {
        child.stdin.write(text);
        child.stdin.end();
      }
    });
  },
};
