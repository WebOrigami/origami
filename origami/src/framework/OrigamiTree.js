import builtins from "../builtins/@builtins.js";
import ExpressionTree from "../common/ExpressionTree.js";
import OrigamiTransform from "./OrigamiTransform.js";

export default class OrigamiTree extends OrigamiTransform(ExpressionTree) {
  constructor(...args) {
    super(...args);

    // By default, expressions in the tree have access to built-in functions.
    this.parent = builtins;
  }
}
