#!/usr/bin/env node

import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import path from "node:path";
import process, { stdout } from "node:process";
import ori from "../builtins/@ori.js";
import project from "../builtins/@project.js";
import Scope from "../common/Scope.js";
import { getScope, keySymbol } from "../common/utilities.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  const expression = args.join(" ");

  // Find the project root.
  const projectGraph = await project.call(null);

  // Traverse from the project root to the current directory.
  const currentDirectory = process.cwd();
  const relative = path.relative(projectGraph.path, currentDirectory);
  const keys = relative.split(path.sep);
  const graph = await GraphHelpers.traverse(projectGraph, ...keys);

  const baseScope = getScope(graph);

  // If no arguments were passed, show usage.
  if (!expression) {
    await showUsage(baseScope);
    return;
  }

  // Add default graph to scope.
  const ambientsGraph = new ObjectGraph({
    "@current": graph,
  });
  ambientsGraph[keySymbol] = "Origami CLI";
  const scope = new Scope(ambientsGraph, baseScope);

  const result = await ori.call(scope, expression);
  if (result !== undefined) {
    const output = result instanceof Buffer ? result : String(result);
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
  // Work up to the root cause, displaying intermediate messages as we go up.
  if (!error.cause && !error.stack) {
    console.error(error.message);
  } else {
    while (error.cause) {
      console.error(error.message);
      error = error.cause;
    }
  }
  if (error.stack) {
    // Display stack trace for root cause, under the theory that that's the most
    // useful place to look for the problem.
    console.error(error.stack);
  }
  process.exitCode = 1;
}
