import builtins from "../builtins/@builtins.js";
import ExpressionTree from "../common/ExpressionTree.js";
import FileTreeTransform from "./FileTreeTransform.js";

export default class OrigamiTree extends FileTreeTransform(ExpressionTree) {
  constructor(...args) {
    super(...args);

    // By default, expressions in the tree have access to built-in functions.
    this.parent = builtins;
  }
}
