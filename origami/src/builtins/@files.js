import { OrigamiFiles, Scope } from "@graphorigami/language";
import path from "node:path";
import process from "node:process";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

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
  result = Scope.treeWithScope(result, this);
  return result;
}

files.usage = `@files [path]\tTree of files at the given path`;
files.documentation = "https://graphorigami.org/language/@files.html";
