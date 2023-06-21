import FileLoadersTransform from "../common/FileLoadersTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

/**
 * @param {Constructor<Explorable>} Base
 */
export default function FileTreeTransform(Base) {
  return class FileTree extends InheritScopeTransform(
    FileLoadersTransform(Base)
  ) {};
}
