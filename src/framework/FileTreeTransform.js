import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

export default function FileTreeTransform(Base) {
  return class FileTree extends InheritScopeTransform(
    FileLoadersTransform(ImplicitModulesTransform(Base))
  ) {};
}
