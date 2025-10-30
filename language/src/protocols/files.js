import os from "node:os";
import path from "node:path";
import process from "node:process";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";

/**
 *
 * @param {string[]} keys
 */
export default async function files(...keys) {
  // If path begins with `~`, treat it relative to the home directory.
  // Otherwise, treat it relative to the current working directory.
  let relativePath = keys.join(path.sep);
  let basePath;
  if (relativePath.startsWith("~")) {
    basePath = os.homedir();
    relativePath = relativePath.slice(2);
  } else {
    basePath = process.cwd();
  }
  const resolved = path.resolve(basePath, relativePath);

  const result = new OrigamiFileMap(resolved);
  return result;
}
