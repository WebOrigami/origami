#!/usr/bin/env node

import process, { stdout } from "process";
import config from "../builtins/config.js";
import ori from "../builtins/ori.js";
import Scope from "../common/Scope.js";
import { getScope } from "../framework/scopeUtilities.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  const currentConfig = await config();

  // If no arguments were passed, show usage.
  const expression = args.join(" ");
  if (!expression) {
    await showUsage(currentConfig);
    return;
  }

  // Find the default graph.
  const defaultGraph = await currentConfig.get("defaultGraph");
  const graph = await defaultGraph();

  // Add default graph to scope.
  const scope = new Scope(
    {
      "@defaultGraph": graph,
    },
    getScope(graph)
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
