#!/usr/bin/env node

import {
  AsyncExplorable,
  asyncGet,
  asyncOps,
  Explorable,
} from "@explorablegraph/core";
import { evaluate } from "@explorablegraph/exlang";
import { ParentFiles } from "@explorablegraph/node";
import process from "process";
import builtins from "./builtins.js";
import defaultModuleExport from "./commands/defaultModuleExport.js";

// Load config file.
const configFileName = "eg.config.js";
const parentFiles = new ParentFiles(process.cwd());
const configPath = await parentFiles[asyncGet](configFileName);
const fn = configPath ? await defaultModuleExport(configPath) : null;
const config = AsyncExplorable(fn);

// Prefer user's config if one was found, otherwise use builtins.
// const scope = config || builtins;
const scope = builtins;

async function main(...args) {
  const source = args.join(" ").trim();
  if (!source) {
    await showUsage(scope);
  }
  const result = await evaluate(source, scope, "**input**");
  if (result) {
    await stdout(result);
  }
}

async function showUsage(commands) {
  console.log("Usage: eg <expression>, with available functions:");
  const usages = [];
  for await (const key of commands) {
    const command = await commands[asyncGet](key);
    let usage = command.usage;
    if (!usage) {
      usage = typeof command === "function" ? `${key}()` : key;
    }
    usages.push(usage);
  }
  usages.sort();
  console.log(usages.join("\n"));
}

export default async function stdout(obj) {
  let output;
  if (obj === undefined) {
    return;
  } else if (obj instanceof Explorable) {
    const strings = await asyncOps.strings(obj);
    output = JSON.stringify(strings, null, 2);
  } else {
    output = obj;
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
