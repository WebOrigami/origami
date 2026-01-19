import os from "node:os";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";

/**
 *
 * @param {any[]} args
 */
export default async function files(...args) {
  const state = args.pop(); // Remaining args are the path

  // If path begins with `~`, treat it relative to the home directory.
  // Otherwise, treat it relative to the current container.
  let relativePath = args.join(path.sep);
  let basePath;
  if (relativePath.startsWith("~")) {
    basePath = os.homedir();
    relativePath = relativePath.slice(2);
  } else {
    const { container } = state;
    basePath = container.path;
  }
  const resolved = path.resolve(basePath, relativePath);

  const result = new OrigamiFileMap(resolved);
  return result;
}
files.needsState = true;
