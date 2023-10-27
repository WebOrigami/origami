import * as compile from "../compiler/compile.js";
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
