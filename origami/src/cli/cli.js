#!/usr/bin/env node

import { Graph, ObjectGraph } from "@graphorigami/core";
import path from "node:path";
import process, { stdout } from "node:process";
import ori from "../builtins/@ori.js";
import project from "../builtins/@project.js";
import Scope from "../common/Scope.js";
import { getScope, graphInContext, keySymbol } from "../common/utilities.js";
import showUsage from "./showUsage.js";

async function main(...args) {
  const expression = args.join(" ");

  // Find the project root.
  const projectGraph = await project.call(null);

  // If no arguments were passed, show usage.
  if (!expression) {
    const config = projectGraph.parent;
    await showUsage(config);
    return;
  }

  // Splice ambients graph into project graph scope.
  const ambients = new ObjectGraph({
    [keySymbol]: "Origami CLI",
  });
  let graph = graphInContext(
    projectGraph,
    new Scope(ambients, projectGraph.parent)
  );

  // Traverse from the project root to the current directory.
  const currentDirectory = process.cwd();
  const relative = path.relative(projectGraph.path, currentDirectory);
  if (relative !== "") {
    const keys = relative
      .split(path.sep)
      .map((key) => (key === "" ? Graph.defaultValueKey : key));
    graph = await Graph.traverse(graph, ...keys);
  }

  // Add ambient property for the current graph.
  await ambients.set("@current", graph);

  const scope = getScope(graph);
  const result = await ori.call(scope, expression);
  if (result !== undefined) {
    const output = result instanceof Buffer ? result : String(result);
    await stdout.write(output);

    // If stdout points to the console, and the result didn't end in a newline,
    // then output a newline.
    if (stdout.isTTY) {
      const lastChar = output[output.length - 1];
      const isNewLine = lastChar === "\n" || lastChar === 10;
      if (!isNewLine) {
        await stdout.write("\n");
      }
    }
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
try {
  await main(...args);
} catch (/** @type {any} */ error) {
  // Work up to the root cause, displaying intermediate messages as we go up.
  if (!error.cause && !error.stack) {
    console.error(error.message);
  } else {
    while (error.cause) {
      console.error(error.message);
      error = error.cause;
    }
  }
  if (error.stack) {
    // Display stack trace for root cause, under the theory that that's the most
    // useful place to look for the problem.
    console.error(error.stack);
  }
  process.exitCode = 1;
}
