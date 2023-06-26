import { GraphHelpers } from "@graphorigami/core";
import ConstantGraph from "../common/ConstantGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Let a graph (e.g., of files) respond to changes.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("../core/explorable").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 * @param {Invocable} [fn]
 */
export default async function watch(variant, fn) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }

  // Watch the indicated graph.
  /** @type {any} */
  const container = GraphHelpers.from(variant);
  await /** @type {any} */ (container).watch?.();

  // // Watch graphs in scope.
  // const scope = /** @type {any} */ (container).scope;
  // await scope?.watch?.();

  if (fn === undefined) {
    return container;
  }

  // The caller supplied a function to reevaluate whenever the graph changes.
  let graph = await evaluateGraph(container.scope, fn);

  // We want to return a stable reference to the graph, so we'll use a prototype
  // chain that will always point to the latest graph. We'll extend the graph's
  // prototype chain with an empty object, and use that as a handle (pointer to
  // a pointer) to the graph. This is what we'll return to the caller.
  const handle = Object.create(graph);

  // Reevaluate the function whenever the graph changes.
  container.addEventListener?.("change", async () => {
    const graph = await evaluateGraph(container.scope, fn);
    updateIndirectPointer(handle, graph);
  });

  return handle;
}

async function evaluateGraph(scope, fn) {
  let graph;
  let message;
  let result;
  try {
    result = await fn.call(scope);
  } catch (error) {
    message = messageForError(error);
  }
  graph = result ? GraphHelpers.from(result) : undefined;
  if (graph) {
    return graph;
  }
  if (!message) {
    message = `warning: watch expression did not return a graph`;
  }
  console.warn(message);
  graph = new ConstantGraph(message);
  return graph;
}

function messageForError(error) {
  let message = "";
  // Work up to the root cause, displaying intermediate messages as we go up.
  while (error.cause) {
    message += error.message + `\n`;
    error = error.cause;
  }
  if (error.name) {
    message += `${error.name}: `;
  }
  message += error.message;
  return message;
}

// Update an indirect pointer to a target.
function updateIndirectPointer(indirect, target) {
  // Clean the pointer of any named properties or symbols that have been set
  // directly on it.
  for (const key of Object.getOwnPropertyNames(indirect)) {
    delete indirect[key];
  }
  for (const key of Object.getOwnPropertySymbols(indirect)) {
    delete indirect[key];
  }

  Object.setPrototypeOf(indirect, target);
}

watch.usage = `@watch <folder>, [expr]\tLet a folder graph respond to changes`;
watch.documentation = "https://graphorigami.org/language/@watch.html";
