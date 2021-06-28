#!/usr/bin/env node

import process from "process";
import evaluate from "../../src/eg/evaluate.js";
import config from "./commands/config.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  const scope = await config();
  const source = args.join(" ").trim();
  if (!source) {
    await showUsage(scope);
    return;
  }
  const defaultGraph = await scope.get("defaultGraph");
  const context = await defaultGraph();
  const result = await evaluate(source, scope, context);
  const stdout = await scope.get("stdout");
  await stdout(result);
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
} catch (error) {
  console.error(error);
}
