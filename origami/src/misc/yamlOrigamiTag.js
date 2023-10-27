import * as compile from "../language/compile.js";
import {
  createExpressionFunction,
  isExpressionFunction,
} from "../runtime/expressionFunction.js";

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
