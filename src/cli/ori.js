#!/usr/bin/env node

import process from "process";
import config from "../builtins/config.js";
import Scope from "../common/Scope.js";
import AmbientPropertiesGraph from "../framework/AmbientPropertiesGraph.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";
import * as parse from "../language/parse.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  // Set up
  const currentConfig = await config();

  // If no arguments were passed, show usage.
  const source = args.join(" ").trim();
  if (!source) {
    await showUsage(currentConfig);
    return;
  }

  // Find the default graph.
  const getDefaultGraph = await currentConfig.get("defaultGraph");
  const defaultGraph = await getDefaultGraph();

  // Construct scope, adding default graph as an ambient property.
  const scope = new Scope(
    new AmbientPropertiesGraph({
      "@defaultGraph": defaultGraph,
    }),
    defaultGraph,
    currentConfig
  );

  // Parse
  const parsed = parse.expression(source);
  let code = parsed?.value;
  if (!code || parsed.rest !== "") {
    console.error(`ori: could not recognize command: ${source}`);
    return;
  }

  if (!source.endsWith(")")) {
    // The source ends without an explicit parenthesis. If the rightmost call in
    // the code tree is a function, we'll want to invoke it.
    code = patchDanglingFunction(code);
  }

  // Execute
  let result = await execute.call(scope, code);

  // If result was a function, execute it.
  if (typeof result === "function") {
    result = await result();
  }

  // Display the result.
  const stdout = await currentConfig.get("stdout");
  await stdout(result);
}

// If the user didn't explicitly specify end the source with a parenthesis, but
// the rightmost derivation of the code is a function, we'll want to implicitly
// invoke it. We can't tell at this time whether the code is a function or not,
// so we'll change the ops from `ops.scope` to `ops.implicitCall` to check for a
// function at runtime and -- if it's a function -- invoke it.
function patchDanglingFunction(code) {
  if (code instanceof Array) {
    const isGet =
      code.length === 2 && code[0] === ops.scope && typeof code[1] === "string";
    if (isGet) {
      // Change ops.scope to ops.implicitCall
      return [ops.implicitCall, code[1]];
    } else {
      // Recurse
      const last = code[code.length - 1];
      const patched = patchDanglingFunction(last);
      const newCode = code.slice();
      newCode[code.length - 1] = patched;
      return newCode;
    }
  }
  // Return the code as is.
  return code;
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
