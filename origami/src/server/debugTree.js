import { trailingSlash } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinsTree } from "../internal.js";
import { resultDecomposition, traceHtml } from "./trace.js";

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

export async function loadDebugSite() {
  const folderPath = path.resolve(fileURLToPath(import.meta.url), "..");
  const folder = new OrigamiFiles(folderPath);
  folder.parent = builtinsTree;
  const packed = await folder.get("debug.ori");
  const site = await packed.unpack();
  return site;
}

export async function saveTrace(debugTree, result, keys) {
  addValueToObject(await debugTree[".trace"], keys, () => {
    const links = traceHtml(result, "/");
    return JSON.stringify(links, null, 2);
  });
  const decompositionKeys = [...keys, "~"];
  addValueToObject(await debugTree[".results"], decompositionKeys, (key) => {
    const decomposition = resultDecomposition(result);
    return key ? decomposition[trailingSlash.remove(key)] : decomposition;
  });
}
