#!/usr/bin/env node

import { Tree } from "@weborigami/async-tree";
import { formatError, projectRootFromPath } from "@weborigami/language";
import path from "node:path";
import process, { stdout } from "node:process";
import help from "../dev/help.js";
import ori from "../origami/ori.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

async function main(...args) {
  const expression = args.join(" ");

  // Find the project root.
  const currentDirectory = process.cwd();
  const projectRoot = await projectRootFromPath(currentDirectory);

  // If no arguments were passed, show usage.
  if (!expression) {
    const usage = await help();
    console.log(usage);
    return;
  }

  // Traverse from the project root to the current directory.
  const relative = path.relative(projectRoot.path, currentDirectory);
  const parent = await Tree.traversePath(projectRoot, relative);

  const result = await ori(expression, { parent });

  if (result !== undefined) {
    const output =
      result instanceof ArrayBuffer
        ? new Uint8Array(result)
        : typeof result === "string" || result instanceof TypedArray
          ? result
          : String(result);
    await stdout.write(output);

    // If stdout points to the console, and the result didn't end in a newline,
    // then output a newline.
    if (stdout.isTTY) {
      const lastChar = output[output.length - 1];
      const isNewLine = lastChar === "\n" || lastChar === 10;
      if (!isNewLine) {
        await stdout.write("\n");
      }
    }
  }
}

// Process command line arguments
const args = process.argv;
args.shift(); // "node"
args.shift(); // name of this script file
// Not sure why we end up with blank arguments; skip them.
while (args[0] === "") {
  args.shift();
}
try {
  await main(...args);
} catch (/** @type {any} */ error) {
  console.error(formatError(error));
  process.exitCode = 1;
}
