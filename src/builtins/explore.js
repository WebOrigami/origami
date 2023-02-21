import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../cli/builtins.js";
import Scope from "../common/Scope.js";
import StringWithGraph from "../common/StringWithGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import FilesGraph from "../core/FilesGraph.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";
import debug from "./debug.js";
import ifBuiltin from "./if.js";
import mapBuiltin from "./map.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkDir = path.resolve(dirname, "../framework");
const frameworkFiles = new FilesGraph(frameworkDir);

/**
 * @this {Explorable}
 */
export default async function explore() {
  const scope = /** @type {any} */ (this).scope ?? this;
  const templateText = await frameworkFiles.get("explore.ori");
  const templateScope = new Scope(
    {
      map: mapBuiltin,
      if: ifBuiltin,
    },
    scope
  );
  const template = new OrigamiTemplate(templateText, templateScope);
  const data = await getKeyData(scope);
  const text = await template.apply(data, templateScope);

  const extendedScope = new Scope(
    {
      "@defaultGraph": this,
    },
    scope
  );
  const graph = await debug.call(this, extendedScope);
  // Graph will be its own scope.
  /** @type {any} */ (graph).scope = scope;
  const result = new StringWithGraph(text, graph);

  return result;
}

function filterKeys(keys) {
  const filtered = [];
  let previous = null;
  for (const key of keys) {
    const keyText = key.toString();
    if (keyText.startsWith(".")) {
      // Skip "private" files.
      continue;
    }
    if (previous && keyText.includes("=")) {
      const equalsIndex = keyText.indexOf("=");
      const lhs = keyText.substring(0, equalsIndex).trim();
      const rhs = keyText.substring(equalsIndex + 1).trim();
      if (lhs.trim() === previous) {
        // Formula for the previous key replaces it.
        filtered.pop();
      }
      filtered.push({
        text: lhs,
        formula: rhs,
      });
    } else {
      filtered.push({
        text: key,
      });
    }
    previous = keyText;
  }
  return filtered;
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

async function getKeyData(scope) {
  const graphs = scope.graphs ?? [scope];
  const keys = [];
  for (const graph of graphs) {
    if (isBuiltins(graph)) {
      // Skip builtins.
      continue;
    }
    const graphKeys = graph.allKeys
      ? await graph.allKeys()
      : await ExplorableGraph.keys(graph);
    const filtered = filterKeys(graphKeys);
    keys.push(filtered);
  }
  return keys;
}
