import { incrementCount } from "../core/measure.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";
import * as parse from "../language/parse.js";
import { additionsPrefix } from "./AdditionsTransform.js";
import { getScope } from "./scopeUtilities.js";

export const inheritableFormulaPrefix = "…";

export default class Formula {
  inheritable;
  key;
  expression;
  source;

  constructor(key, expression, source, inheritable) {
    this.key = key;
    this.expression = expression;
    this.inheritable = inheritable;
    this.source = source;
  }

  // Find ops.thisKey referernces in the code and replace them with this
  // formula's `source`. TODO: This code has evolved to the point where the name
  // is no longer appropriate; rename.
  bindCode(code) {
    if (!(code instanceof Array)) {
      return code;
    } else if (code[0] === ops.thisKey) {
      // Special case: if the source ends in `.js`, we omit that from the
      // source. We rely on ImplicitModulesTransform to map an attempt to get
      // `foo = this()` to loading the module `foo = this().js`.
      const source = this.source.endsWith(".js")
        ? this.source.slice(0, -3)
        : this.source;
      return source;
    } else {
      return code.map((c) => this.bindCode(c));
    }
  }

  /**
   * Evaluate the formula in the context of the given graph.
   *
   * @param {Explorable} graph
   */
  async evaluate(graph) {
    const scope = getScope(graph);
    if (this.expression) {
      const code = this.bindCode(this.expression);
      return execute.call(scope, code);
    } else {
      // Local constant declaration
      return scope.get(this.source);
    }
  }

  static isFormula(key) {
    // This check recapitulates some of what the parser does, although less
    // flexibly. It might be preferable to actually invoke the parser here.
    return (
      typeof key === "string" &&
      (key.includes("=") ||
        key.startsWith("[") ||
        key.startsWith(inheritableFormulaPrefix) ||
        key.startsWith(additionsPrefix))
    );
  }

  static parse(source) {
    // Try to parse the base key as a key.
    incrementCount("Formula parse");
    const parsed = parse.key(source);
    const value = parsed?.value ?? null;
    const rest = parsed?.rest ?? null;
    if (!value || rest.length > 0) {
      // Unsuccessful parse
      if (source.includes("=")) {
        console.warn(`Formula: couldn't parse formula: ${source}`);
      }
      return null;
    }
    const inheritable = source.startsWith(inheritableFormulaPrefix);
    if (value[0] === "=") {
      // Assignment
      const [_, left, expression] = value;
      return new Formula(left, expression, source, inheritable);
    } else {
      return null;
    }
  }
}
