import { ObjectTree } from "@graphorigami/core";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";
import { isExpressionFunction } from "./expressionFunction.js";

export default class ExpressionTree extends InvokeFunctionsTransform(
  ObjectTree
) {
  // Return the unevaluated expressions in the original object.
  expressions() {
    const obj = /** @type {any} */ (this).object;
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      if (isExpressionFunction(value)) {
        result[key] = value.code;
      }
    }
    return result;
  }
}
