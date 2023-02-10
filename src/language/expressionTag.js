import Expression from "./Expression.js";
import { expression } from "./parse.js";

/**
 * A YAML tag for an Origami expression.
 */
export default {
  identify: (value) => value instanceof Expression,

  resolve(str) {
    const parsed = expression(str);
    if (!parsed || parsed.rest !== "") {
      throw new Error(`Couldn't parse Origami expression: ${str}`);
    }
    return new Expression(parsed.value);
  },

  tag: "!ori",
};
