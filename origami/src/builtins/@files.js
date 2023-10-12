/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import path from "node:path";
import process from "node:process";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import OrigamiFiles from "../framework/OrigamiFiles.js";

/**
 * @this {AsyncDictionary|null}
 * @param {string[]} keys
 */
export default async function files(...keys) {
  assertScopeIsDefined(this);
  const resolved = path.resolve(process.cwd(), ...keys);
  return new OrigamiFiles(resolved);
}

files.usage = `@files [path]\tGraph of files at the given path`;
files.documentation = "https://graphorigami.org/language/@files.html";
