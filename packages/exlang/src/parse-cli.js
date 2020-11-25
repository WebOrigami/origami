#!/usr/bin/env node

import process from "process";
import parse from "./parse.js";

// Process command line arguments
const args = process.argv;
args.shift(); // "node"
args.shift(); // name of this script file
// Not sure why we end up with blank arguments; skip them.
while (args[0] === "") {
  args.shift();
}

const source = args.join(" ");
const parsed = parse(source);
console.log(String(parsed));
