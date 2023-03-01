import ExpressionGraph from "../common/ExpressionGraph.js";
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

export default class OrigamiGraph extends InheritScopeTransform(
  FileLoadersTransform(ImplicitModulesTransform(ExpressionGraph))
) {}
