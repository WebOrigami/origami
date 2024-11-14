import { OrigamiFiles } from "@weborigami/language";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function files(...keys) {
  assertTreeIsDefined(this, "files:");

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

  const result = new OrigamiFiles(resolved);
  return result;
}
