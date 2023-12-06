import { expressionFunction } from "@weborigami/language";
import * as compile from "../../../language/src/compiler/compile.js";
/**
 * A YAML tag for an Origami expression.
 */
export default {
  identify: expressionFunction.isExpressionFunction,

  resolve(str) {
    const code = compile.expression(str);
    return code instanceof Array
      ? expressionFunction.createExpressionFunction(code)
      : code;
  },

  tag: "!ori",
};
