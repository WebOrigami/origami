#!/usr/bin/env node

import { ObjectTree, Tree } from "@weborigami/async-tree";
import { Scope, formatError } from "@weborigami/language";
import path from "node:path";
import process, { stdout } from "node:process";
import ori from "../builtins/@ori.js";
import project from "../builtins/@project.js";
import { keySymbol } from "../common/utilities.js";
import showUsage from "./showUsage.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

async function main(...args) {
  const expression = args.join(" ");

  // Find the project root.
  const projectTree = await project.call(null);

  // HACK: get the configuration via the project.
  const config = new Scope(...projectTree.scope.trees.slice(1));

  // If no arguments were passed, show usage.
  if (!expression) {
    await showUsage(config);
    return;
  }

  // Splice ambients tree into project tree scope.
  const ambients = new ObjectTree({});
  ambients[keySymbol] = "Origami CLI";
  let tree = Scope.treeWithScope(projectTree, new Scope(ambients, config));

  // Traverse from the project root to the current directory.
  const currentDirectory = process.cwd();
  const relative = path.relative(projectTree.path, currentDirectory);
  if (relative !== "") {
    tree = await Tree.traversePath(tree, relative);
  }

  // Add ambient property for the current tree.
  await ambients.set("@current", tree);

  const scope = Scope.getScope(tree);
  const result = await ori.call(scope, expression);
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
