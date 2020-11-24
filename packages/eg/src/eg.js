#!/usr/bin/env node

import process from "process";
import commands from "./commands.js";

async function invoke(command, ...args) {
  const commandFilename = `${command}.js`;
  const exports = command
    ? await commands[commands.constructor.get](commandFilename)
    : undefined;
  const fn = exports?.default;
  if (!fn) {
    await showUsage();
    return;
  }
  await fn(...args);
}

async function showUsage() {
  for await (const name of commands) {
    const exports = await commands[commands.constructor.get](name);
    console.log(exports.default.usage);
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
await invoke(...args);
