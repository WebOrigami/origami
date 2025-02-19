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

let site;

export async function load() {
  if (!site) {
    const folderPath = path.resolve(fileURLToPath(import.meta.url), "..");
    const folder = new OrigamiFiles(folderPath);
    folder.parent = builtinsTree;
    const packed = await folder.get("debug.ori");
    site = await packed.unpack();
  }
  return site;
}

export async function saveTrace(trace, keys) {
  addValueToObject(await site[".trace"], keys, () => {
    const path = `/.results/${keys.join("/")}/~/`;
    return traceHtml(trace, path);
  });
  // site[".trace"] = await traceHtml(trace, "/");

  const decompositionKeys = [...keys, "~"];
  addValueToObject(await site[".results"], decompositionKeys, (key) => {
    const decomposition = resultDecomposition(trace);
    return key ? decomposition[trailingSlash.remove(key)] : decomposition;
  });
  // site[".results"] = resultDecomposition(trace);
}
