#!/usr/bin/env node

import { evaluate } from "@explorablegraph/exlang";
import process from "process";
import commands from "./commands.js";

async function main(...args) {
  const source = args.join(" ");
  const result = await evaluate(source, commands, "**input**");
  if (result && commands.stdout) {
    await commands.stdout(result);
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
await main(...args);
