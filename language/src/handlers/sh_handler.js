import { toString } from "@weborigami/async-tree";
import { spawn } from "node:child_process";

/**
 * Shell script file extension handler
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed) {
    const scriptText = toString(packed);

    if (scriptText === null) {
      throw new Error(".sh handler: input isn't text");
    }

    return async (input) => {
      return runShellScript(scriptText, input);
    };
  },
};

/**
 * Run arbitrary shell script text in /bin/sh and feed it stdin.
 * Supports multiple commands, pipelines, redirects, etc.
 *
 * @param {string} scriptText - Shell code (may contain newlines/side effects)
 * @param {import("@weborigami/async-tree").Stringlike} inputText  - Text to pipe to the script's stdin
 * @returns {Promise<string>}
 */
function runShellScript(scriptText, inputText) {
  if (inputText instanceof Function) {
    throw new Error(
      "A .sh file expects text input but got a function instead. Did you mean to invoke the function?",
    );
  }
  return new Promise((resolve, reject) => {
    // Use sh -c "<scriptText>" so stdin is free for inputText
    const child = spawn("sh", ["-c", scriptText], {
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        /** @type {any} */
        const err = new Error(
          `Shell exited with code ${code}${stderr ? `: ${stderr}` : ""}`,
        );
        err.code = code;
        err.stdout = stdout;
        err.stderr = stderr;
        return reject(err);
      }
      resolve(stdout);
    });

    // Feed the input to the script's stdin and close it
    child.stdin.end(inputText);
  });
}
