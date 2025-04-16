import { Tree, isUnpackable } from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import process, { stdout } from "node:process";
import readline from "node:readline";
import { formatResult } from "../origami/formatResult.js";
import ori from "../origami/ori.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

// ANSI escape codes for colored text
const red = "\x1b[31m";
const reset = "\x1b[0m";
const yellow = "\x1b[33m";

let current;

function prompt() {
  return `${yellow}${current.path}>${reset} `;
}

// Start read-eval-print loop
export default async function repl() {
  current = this;

  return new Promise((resolve) => {
    const repl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: prompt(),
    });

    // Listen for each line of user input.
    repl.on("line", async (line) => {
      await evaluateLine(line);
      repl.setPrompt(prompt());
      repl.prompt();
    });

    // When the input stream ends (Ctrl+D), close the interface.
    repl.on("close", () => {
      console.log("");
      resolve(undefined);
    });

    // Start REPL
    repl.prompt();
  });
}

async function evaluateLine(line) {
  const trimmed = line.trim();
  if (trimmed !== "") {
    let result;
    let wasError = false;
    try {
      result = await ori.call(current, line, { formatResult: false });
    } catch (/** @type {any} */ error) {
      const message = formatError(error);
      result = `${red}${message}${reset}`;
      wasError = true;
    }

    if (
      !wasError &&
      (trimmed.startsWith("go:") || trimmed.startsWith("cd ")) &&
      (Tree.isTreelike(result) || isUnpackable(result))
    ) {
      // Take the result as the new tree
      current = Tree.from(result);
    } else if (result !== undefined) {
      result = wasError ? result : await formatResult(result);
      const output =
        result instanceof ArrayBuffer
          ? new Uint8Array(result)
          : typeof result === "string" || result instanceof TypedArray
          ? result
          : String(result);

      await stdout.write(output);

      // If the result didn't end in a newline, then output a newline.
      const lastChar = output[output.length - 1];
      const isNewLine = lastChar === "\n" || lastChar === 10;
      if (!isNewLine) {
        await stdout.write("\n");
      }
    }
  }
}
