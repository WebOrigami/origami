#!/usr/bin/env node

import process, { stdout } from "process";
import ori from "../builtins/ori.js";
import Scope from "../common/Scope.js";
import { getScope } from "../framework/scopeUtilities.js";
import builtins from "./builtins.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  const expression = args.join(" ");

  // Find the default graph.
  const defaultGraph2 = await builtins.get("defaultGraph2");
  const graph = await defaultGraph2();
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

  const text = await ori.call(scope, expression);
  if (text) {
    await stdout.write(text);
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
  console.error(error);
}
