import { interop, pathFromKeys } from "@weborigami/async-tree";
import os from "node:os";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";
import executionContext from "../runtime/executionContext.js";

/**
 * Return the file or directory indicated by the given path of keys.
 *
 * @param {string[]} keys
 */
export default async function files(...keys) {
  let relativePath = pathFromKeys(keys);

  let replacement = relativePath;
  let trailingSlashMessage = "";
  if (!replacement.endsWith("/")) {
    replacement += "/";
    trailingSlashMessage = "with a trailing slash ";
  }

  interop.warn(
    `Warning: The files: protocol is deprecated, use a plain path ${trailingSlashMessage}instead: ${replacement}`,
  );

  // If path begins with `~`, treat it relative to the home directory.
  // Otherwise, treat it relative to the current container.
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
