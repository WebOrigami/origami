import { ObjectGraph } from "@graphorigami/core";
import { isExpressionFunction } from "../language/expressionFunction.js";
import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";

export default class ExpressionGraph extends InvokeFunctionsTransform(
  ObjectGraph
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
