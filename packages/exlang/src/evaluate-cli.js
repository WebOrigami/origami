#!/usr/bin/env node

import { AsyncExplorable } from "@explorablegraph/core";
import process from "process";
import evaluate from "./evaluate.js";

// Process command line arguments
const args = process.argv;
args.shift(); // "node"
args.shift(); // name of this script file
// Not sure why we end up with blank arguments; skip them.
while (args[0] === "") {
  args.shift();
}

const source = args.join(" ");
const scope = AsyncExplorable({
  hello(name) {
    return `Hello ${name}`;
  },
});
const result = await evaluate(source, scope, "**input**");
console.log(result);
