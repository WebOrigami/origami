import os from "node:os";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";
import executionContext from "../runtime/executionContext.js";

/**
 *
 * @param {any[]} args
 */
export default async function files(...args) {
  // If path begins with `~`, treat it relative to the home directory.
  // Otherwise, treat it relative to the current container.
  let relativePath = args.join(path.sep);
  let basePath;
  if (relativePath.startsWith("~")) {
    basePath = os.homedir();
    relativePath = relativePath.slice(2);
  } else {
    const parent = executionContext.getStore()?.parent;
    basePath = parent.path;
  }
  const resolved = path.resolve(basePath, relativePath);

  const result = new OrigamiFileMap(resolved);
  await result.initializeGlobals();
  return result;
}
