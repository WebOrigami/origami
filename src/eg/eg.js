#!/usr/bin/env node

import process from "process";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import evaluate from "../../src/eg/evaluate.js";
import ParentFiles from "../../src/node/ParentFiles.js";
import ExplorableObject from "../core/ExplorableObject.js";
import { stringify } from "../core/utilities.js";
import builtins from "./builtins.js";
import defaultModuleExport from "./commands/defaultModuleExport.js";
import showUsage from "./showUsage.js";

// Load config file.
const configFileName = "eg.config.js";
const parentFiles = new ParentFiles(process.cwd());
const configPath = await parentFiles.get(configFileName);
const fn = configPath ? await defaultModuleExport(configPath) : null;
const config = fn ? ExplorableObject.explore(fn) : null;

// Prefer user's config if one was found, otherwise use builtins.
const scope = config || builtins;

// Give the `config()` builtin a reference to the current scope. This lets
// someone inspect the scope from the command line.
const configBuiltin = await scope.get("config");
if (configBuiltin) {
  configBuiltin.setScope(scope);
}

async function main(...args) {
  const source = args.join(" ").trim();
  if (!source) {
    await showUsage(scope);
  }
  const result = await evaluate(source, scope, "**input**");
  if (result !== undefined) {
    await stdout(result);
  }
}

export default async function stdout(obj) {
  let output;
  if (obj === undefined) {
    return;
  } else if (ExplorableGraph.isExplorable(obj)) {
    // Stringify graph values.
    const strings = await ExplorableGraph.strings(obj);
    // Render to JSON.
    output = JSON.stringify(strings, null, 2);
  } else {
    output = stringify(obj);
  }
  console.log(output);
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
