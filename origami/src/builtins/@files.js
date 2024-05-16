import { OrigamiFiles, Scope } from "@weborigami/language";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function files(...keys) {
  assertScopeIsDefined(this, "files");

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

  /** @type {AsyncTree} */
  let result = new OrigamiFiles(resolved);
  result = Scope.treeWithScope(result, this);
  return result;
}

files.usage = `@files [path]\tTree of files at the given path`;
files.documentation = "https://weborigami.org/language/@files.html";
