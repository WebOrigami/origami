import path from "node:path";
import { fileURLToPath } from "node:url";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import FilesGraph from "../core/FilesGraph.js";
import DefaultPages from "./DefaultPages.js";
import OrigamiTemplate from "./OrigamiTemplate.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkFiles = new FilesGraph(dirname);

/**
 * @this {Explorable}
 */
export default async function scopeExplorer() {
  // Force use of default index.html page.
  const baseScope = /** @type {any} */ (this).scope ?? this;
  const scope = new Scope(
    {
      "@defaultGraph": this,
      "index.html": () => scopeExplorerPage.call(baseScope),
    },
    baseScope
  );
  const graph = new DefaultPages(scope);
  // Graph will be its own scope.
  /** @type {any} */ (graph).scope = scope;
  return graph;
}

async function scopeExplorerPage() {
  const scope = this;
  const templateText = await frameworkFiles.get("scopeExplorer.ori");
  const template = new OrigamiTemplate(templateText, scope);
  const data = await getKeyData(scope);
  const result = await template.apply(data, scope);
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

async function getKeyData(scope) {
  const graphs = scope.graphs ?? [scope];
  const keys = [];
  for (const graph of graphs) {
    const graphKeys = graph.allKeys
      ? await graph.allKeys()
      : await ExplorableGraph.keys(graph);
    const filtered = filterKeys(graphKeys);
    keys.push(filtered);
  }
  return keys;
}
