import { ObjectTree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinsTree } from "../internal.js";
import labeledTree from "./labeledTree.js";
import { resultDecomposition, traceHtml } from "./trace.js";

let debugTemplatePromise;

const debugInfo = {
  ".debug": {
    "index.html": async () => {
      // debugTemplatePromise ??= loadDebugTemplate();
      debugTemplatePromise = loadDebugTemplate();
      const template = await debugTemplatePromise;
      return template();
    },
  },
  ".links": {},
  ".results": {},
};
Object.defineProperty(debugInfo[".debug"], "pack", {
  enumerable: false,
  value: () => debugInfo[".debug"]["index.html"],
});

export const debugTree = new ObjectTree(debugInfo);

// Add a single value to a nested object based on an array of keys.
function addValueToObject(object, keys, value) {
  for (let i = 0, current = object; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      // Write out value
      current[key] = value;
    } else {
      // Traverse further
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
  }
}

async function loadDebugTemplate() {
  const folderPath = path.resolve(fileURLToPath(import.meta.url), "..");
  const folder = new OrigamiFiles(folderPath);
  folder.parent = builtinsTree;
  const templateFile = await folder.get("debug.ori.html");
  return templateFile.unpack();
}

export function saveTrace(result, keys) {
  addValueToObject(debugInfo[".links"], keys, () => {
    const links = traceHtml(result, "/");
    return JSON.stringify(links, null, 2);
  });
  addValueToObject(debugInfo[".results"], keys, (key) => {
    const tree = labeledTree(resultDecomposition(result));
    return key ? tree.get(key) : tree;
  });
}
