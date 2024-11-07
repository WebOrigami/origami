#!/usr/bin/env node

import { Tree } from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import path from "node:path";
import process, { stdout } from "node:process";
import help from "../builtins/help.js";
import ori from "../origami/ori.js";
import project from "../origami/project.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

async function main(...args) {
  const expression = args.join(" ");

  // Find the project root.
  const projectTree = await project.call(null);

  // If no arguments were passed, show usage.
  if (!expression) {
    // HACK: the config is the parent of the project tree.
    const config = projectTree.parent;
    const usage = await help.call(config);
    console.log(usage);
    return;
  }

  // Traverse from the project root to the current directory.
  const currentDirectory = process.cwd();
  const relative = path.relative(projectTree.path, currentDirectory);
  const tree = await Tree.traversePath(projectTree, relative);

  const result = await ori.call(tree, expression);

  if (result === undefined) {
    if (expression === "help") {
      // Special case
      const config = projectTree.parent;
      const usage = await help.call(config);
      console.log(usage);
      return;
    }
  } else {
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
