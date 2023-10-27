import { ObjectTree } from "@graphorigami/core";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";
import { expressionFunction } from "./internal.js";

export default class ExpressionTree extends InvokeFunctionsTransform(
  ObjectTree
) {
  // Return the unevaluated expressions in the original object.
  expressions() {
    const obj = /** @type {any} */ (this).object;
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      if (expressionFunction.isExpressionFunction(value)) {
        result[key] = value.code;
      }
    }
    return result;
  }
}
