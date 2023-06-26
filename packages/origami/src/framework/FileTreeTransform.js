/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

/**
 * @param {Constructor<AsyncDictionary>} Base
 */
export default function FileTreeTransform(Base) {
  return class FileTree extends InheritScopeTransform(
    FileLoadersTransform(Base)
  ) {};
}
