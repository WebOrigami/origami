/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { FilesGraph, ObjectGraph } from "@graphorigami/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextWithContents from "../common/TextWithContents.js";
import { keySymbol } from "../common/utilities.js";
import loadOrigamiTemplate from "../loaders/orit.js";
import debug from "./@debug.js";
import ifBuiltin from "./@if.js";
import mapBuiltin from "./@map/values.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkDir = path.resolve(dirname, "../framework");
const frameworkFiles = new FilesGraph(frameworkDir);

/**
 * @this {AsyncDictionary|null}
 */
export default async function explore() {
  const scope = /** @type {any} */ (this).scope ?? this;
  const templateText = await frameworkFiles.get("explore.ori");
  const templateScope = new Scope(
    {
      map: mapBuiltin,
      // getKeySymbol: (obj) => obj?.[keySymbol],
      if: ifBuiltin,
    },
    scope
  );
  const templateFile = loadOrigamiTemplate.call(templateScope, templateText);
  const template = await templateFile.contents();

  // const scopeGraphs = scope.graphs ?? [scope];
  // const withoutBuiltins = scopeGraphs.filter((graph) => !isBuiltins(graph));
  const data = await getScopeData(scope);
  const text = await template(data);

  const ambientsGraph = new ObjectGraph({
    "@current": this,
  });
  ambientsGraph[keySymbol] = "explore command";
  const extendedScope = new Scope(ambientsGraph, scope);

  const graph = await debug.call(this, extendedScope);
  const result = new TextWithContents(text, graph);

  return result;
}

// To test if a given graph represents the builtins, we walk up the chain to see
// if any of its prototypes are the builtins graph.
function isBuiltins(graph) {
  while (graph) {
    if (graph === builtins) {
      return true;
    }
    graph = Object.getPrototypeOf(graph);
  }
  return false;
}

async function getScopeData(scope) {
  const graphs = scope.graphs ?? [scope];
  const data = [];
  for (const graph of graphs) {
    if (isBuiltins(graph)) {
      // Skip builtins.
      continue;
    }
    const name = graph[keySymbol];
    const graphKeys = Array.from(await graph.keys());
    // Skip system-ish files that start with a period.
    const keys = graphKeys.filter((key) => !key.startsWith?.("."));
    data.push({ name, keys });
  }
  return data;
}

explore.usage = "@explore\tExplore the current scope in the browser";
explore.documentation = "https://graphorigami.org/language/@explore.html";
