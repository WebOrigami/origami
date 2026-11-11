import os from "node:os";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";
import executionContext from "../runtime/executionContext.js";

/**
 *
 * @param {any[]} args
 */
export default async function files(...args) {
  let filePath = args.join("/");

  let resolved;
  if (filePath.startsWith("//") || filePath.startsWith("\\\\")) {
    // Windows UNC path
    resolved = filePath;
  } else if (filePath.startsWith("~/")) {
    // Home directory path
    resolved = path.resolve(os.homedir(), filePath.slice(2));
  } else {
    // Relative to the current execution context's parent
    const parent = executionContext.getStore()?.parent;
    resolved = path.resolve(parent.path, filePath);
  }

  const result = new OrigamiFileMap(resolved);
  await result.initializeGlobals();
  return result;
}
