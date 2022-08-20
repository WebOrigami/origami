import { incrementCount } from "../core/measure.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";
import * as parse from "../language/parse.js";
import { additionsPrefix, peerAdditionsSuffix } from "./AdditionsTransform.js";
import { getScope } from "./scopeUtilities.js";

export const inheritableFormulaPrefix = "…";

export default class Formula {
  closure = {};
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

  // Find unbound variables in the code and replace them with the given
  // bindings. Likewise, find ops.thisKey referernces in the code and replace
  // them with this formula's `source`.
  bindCode(code, bindings) {
    if (!(code instanceof Array)) {
      return code;
    } else if (code[0] === ops.variable) {
      // Variable assignment; apply binding.
      const [_, variable, extension] = code;
      return bindings[variable] + (extension ?? "");
    } else if (code[0] === ops.thisKey) {
      // Special case: if the source ends in `.js`, we omit that from the
      // source. We rely on ImplicitModulesTransform to map an attempt to get
      // `foo = this()` to loading the module `foo = this().js`.
      const source = this.source.endsWith(".js")
        ? this.source.slice(0, -3)
        : this.source;
      return source;
    } else {
      return code.map((c) => this.bindCode(c, bindings));
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
      const bindings = /** @type {any} */ (graph).bindings;
      const code = bindings
        ? this.bindCode(this.expression, bindings)
        : this.expression;
      return execute.call(scope, code);
    } else {
      // Local variable declaration
      return scope.get(this.source);
    }
  }

  get foundInScope() {
    return true;
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
    if (value[0] === ops.variable) {
      // Variable pattern
      const [_, variable, extension] = value;
      return new VariableFormula(
        variable,
        extension,
        null,
        source,
        inheritable
      );
    } else if (value[0] === "=") {
      // Assignment
      const [_, left, expression] = value;
      if (left[0] === ops.variable) {
        // Variable assignment
        const [_, variable, extension] = left;
        return new VariableFormula(
          variable,
          extension,
          expression,
          source,
          inheritable
        );
      } else {
        // Constant assignment
        return new ConstantFormula(left, expression, source, inheritable);
      }
    } else {
      return null;
    }
  }
}

export class ConstantFormula extends Formula {
  addImpliedKeys(keys) {
    // Constant formulas add the name of the constant they define.
    keys.add(this.key);
  }

  unify(key) {
    return this.key === key ? {} : null;
  }
}

export class VariableFormula extends Formula {
  variable;
  extension;
  antecedents;

  constructor(variable, extension, expression, source, inheritable) {
    const key = `[${variable}]${extension ?? ""}`;
    super(key, expression, source, inheritable);
    this.variable = variable;
    this.extension = extension;
    if (expression) {
      // Variable assignment
      this.antecedents = this.#findAntecedents(expression);
    } else {
      // Variable pattern like {x}.foo has {x} with a null extension as an
      // antecedent.
      this.antecedents = [null];
    }
  }

  addImpliedKeys(keys) {
    // Formulas with no antecedents don't imply any new keys, nor do formulas
    // without an extension, nor do ghost keys.
    if (
      !this.antecedents ||
      this.extension === null ||
      this.extension === peerAdditionsSuffix
    ) {
      return;
    }

    // See which keys match the formula's antecedents.
    for (const key of keys) {
      const base = this.#matchExtension(key, this.antecedents[0]);
      if (base) {
        // First antecedent matched; do the rest match?
        const restMatched = this.antecedents
          .slice(1)
          .every((antecedent) => keys.has(base + antecedent));
        if (restMatched) {
          // Determine the consequent of this formula.
          const consequent = base + this.extension;
          keys.add(consequent);
        }
      }
    }
  }

  #findAntecedents(expression) {
    // Scalar values (or no expression) have no antecedents.
    if (!(expression instanceof Array)) {
      return [];
    } else if (expression[0] === ops.variable) {
      // A variable reference means we have an antecedent.
      const [_marker, _variable, extension] = expression;
      return [extension];
    } else {
      // Regular array; gather antecedents from its elements.
      const antecedents = expression.flatMap((element) =>
        this.#findAntecedents(element)
      );
      // Report any unique antecedents.
      const set = new Set(antecedents);
      const unique = [...set];
      return unique;
    }
  }

  get foundInScope() {
    return (
      this.extension !== null &&
      this.extension !== peerAdditionsSuffix &&
      super.foundInScope
    );
  }

  /**
   * Given a key like "foo.html", match it against an extension like ".html"
   * and, if it matches, return the "foo" part. Return null if it didn't match.
   *
   * If the supplied extension is null/empty, see if the given key is a string
   * like "foo" that has no extension; if so, return the key as is, otherwise
   * return null.
   *
   * @param {string} key
   * @param {string} extension
   */
  #matchExtension(key, extension) {
    if (Formula.isFormula(key)) {
      // Formulas don't match patterns.
      return null;
    } else if (extension) {
      // Key matches if it ends with the same extension
      if (key.length > extension.length && key.endsWith(extension)) {
        return key.substring(0, key.length - extension.length);
      }
    } else if (
      typeof key === "string" &&
      !key.includes(".") &&
      !key.endsWith(peerAdditionsSuffix)
    ) {
      // Key matches if it has no extension
      return key;
    }
    return null;
  }

  unify(key) {
    const match = this.#matchExtension(key, this.extension);
    return match ? { [this.variable]: match } : null;
  }
}
