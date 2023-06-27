import FileLoadersTransform from "../common/FileLoadersTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
export default function FileTreeTransform(Base) {
  return class FileTree extends InheritScopeTransform(
    FileLoadersTransform(Base)
  ) {};
}
