import expressionFunction from "./expressionFunction.js";
import { expression } from "./parse.js";

/**
 * A YAML tag for an Origami expression.
 */
export default {
  identify: (value) => typeof value === "function" && value.code !== undefined,

  resolve(str) {
    const parsed = expression(str);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami expression: ${str}`);
    }
    const code = parsed.value;
    return expressionFunction(code);
  },

  tag: "!ori",
};
