#!/usr/bin/env node

import { asyncOps, Explorable } from "@explorablegraph/core";
import { evaluate } from "@explorablegraph/exlang";
// import { asyncGet } from "@explorablegraph/core";
import process from "process";
import YAML from "yaml";
import serve from "./commands/serve.js";
import { loadGraphFromArgument, textFromReadable } from "./shared.js";

// import commands from "./commands.js";

// async function invoke(command, ...args) {
//   const commandFilename = `${command}.js`;
//   const exports = command
//     ? await commands[asyncGet](commandFilename)
//     : undefined;
//   const fn = exports?.default;
//   if (!fn) {
//     await showUsage();
//     return;
//   }
//   await fn(...args);
// }

// async function showUsage() {
//   for await (const name of commands) {
//     const exports = await commands[asyncGet](name);
//     console.log(exports.default.usage);
//   }
// }

export default async function yaml(graph) {
  const obj = await asyncOps.strings(graph);
  const text = YAML.stringify(obj, null, 2);
  return text;
}

async function main(...args) {
  const source = args.join(" ");
  const scope = Explorable({
    file1: () =>
      "/Users/jan/Source/ExplorableGraph/explorable/packages/eg/test/fixtures/letters.js",
    file2: () => "/Users/jan/Source/ExplorableGraph/hello/src/graphs/2.js",
    import: async (file) => {
      return await loadGraphFromArgument(file);
    },
    parse: (text) => {
      const obj = JSON.parse(text);
      return Explorable(obj);
    },
    serve,
    stdin: async () => {
      return await textFromReadable(process.stdin);
    },
    toUpperCase: (text) => text.toUpperCase(),
    yaml,
  });
  const result = await evaluate(source, scope, "**input**");
  if (result instanceof Explorable) {
    const obj = await asyncOps.strings(result);
    const text = JSON.stringify(obj, null, 2);
    console.log(text);
  } else if (result !== undefined) {
    console.log(result);
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
