#!/usr/bin/env node

import process from "process";
import execute from "../../src/eg/execute.js";
import config from "./commands/config.js";
import { parse } from "./parse.js";
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
  const parsed = parse(source);
  console.log(JSON.stringify(parsed));
  if (!parsed) {
    console.error(`Could not recognize command: ${source}`);
    return;
  }
  const result = await execute(parsed, scope, context);
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
