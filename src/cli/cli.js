#!/usr/bin/env node

import process, { stdout } from "node:process";
import ori from "../builtins/ori.js";
import Scope from "../common/Scope.js";
import { getScope } from "../framework/scopeUtilities.js";
import builtins from "./builtins.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  const expression = args.join(" ");

  // Find the default graph.
  const defaultGraph = await builtins.get("defaultGraph");
  const graph = await defaultGraph();
  const baseScope = getScope(graph);

  // If no arguments were passed, show usage.
  if (!expression) {
    await showUsage(baseScope);
    return;
  }

  // Add default graph to scope.
  const scope = new Scope(
    {
      "@defaultGraph": graph,
    },
    baseScope
  );

  const result = await ori.call(scope, expression);
  if (result) {
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
  if (!error.cause) {
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
}
