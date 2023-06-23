import * as compile from "./compile.js";
import {
  createExpressionFunction,
  isExpressionFunction,
} from "./expressionFunction.js";

/**
 * A YAML tag for an Origami expression.
 */
export default {
  identify: isExpressionFunction,

  resolve(str) {
    const code = compile.expression(str);
    return code instanceof Array ? createExpressionFunction(code) : code;
  },

  tag: "!ori",
};
