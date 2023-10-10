/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { FilesGraph } from "@graphorigami/core";
import path from "node:path";
import process from "node:process";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @this {AsyncDictionary|null}
 * @param {string[]} keys
 */
export default async function files(...keys) {
  assertScopeIsDefined(this);
  const resolved = path.resolve(process.cwd(), ...keys);
  return new (FileTreeTransform(FilesGraph))(resolved);
}

files.usage = `@files [path]\tGraph of files at the given path`;
files.documentation = "https://graphorigami.org/language/@files.html";
