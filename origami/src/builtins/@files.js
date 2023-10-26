import path from "node:path";
import process from "node:process";
import { treeWithScope } from "../common/utilities.js";
import OrigamiFiles from "../framework/OrigamiFiles.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function files(...keys) {
  assertScopeIsDefined(this);
  const resolved = path.resolve(process.cwd(), ...keys);
  /** @type {AsyncTree} */
  let result = new OrigamiFiles(resolved);
  result = treeWithScope(result, this);
  return result;
}

files.usage = `@files [path]\tTree of files at the given path`;
files.documentation = "https://graphorigami.org/language/@files.html";
