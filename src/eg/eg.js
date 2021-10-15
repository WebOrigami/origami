#!/usr/bin/env node

import process from "process";
import execute from "../../src/eg/execute.js";
import * as ops from "../../src/eg/ops.js";
import config from "./commands/config.js";
import * as parse from "./parse.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  // Set up
  const scope = await config();
  const source = args.join(" ").trim();
  if (!source) {
    await showUsage(scope);
    return;
  }
  const defaultGraph = await scope.get("defaultGraph");
  const graph = await defaultGraph();

  // Parse
  const parsed = parse.expression(source);
  const code = parsed?.value;
  if (!code || parsed.rest !== "") {
    console.error(`eg: could not recognize command: ${source}`);
    return;
  }
  let errorIfResultUndefined = code[0] === ops.get;

  // Execute
  let result = await execute(code, scope, graph);

  // If result was a function, execute it.
  if (typeof result === "function") {
    errorIfResultUndefined = false;
    result = await result();
  }

  // We don't generally complain if the result is undefined; the user may be
  // invoking a function that does work but doesn't return a result. However, if
  // the request was only a `get` for something that doesn't exist, say so.
  if (result === undefined && errorIfResultUndefined) {
    console.error(`eg: could not find ${code[1]}`);
  }

  // Display the result.
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
} catch (/** @type {any} */ error) {
  console.error(error);
}
