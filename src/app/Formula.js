import execute from "../eg/execute.js";
import * as ops from "../eg/ops.js";
import * as parse from "../eg/parse.js";
import { additionsKey } from "./AdditionsMixin.js";

export default class Formula {
  key;
  expression;
  source;

  constructor(key, expression, source) {
    this.key = key;
    this.expression = expression;

    // Special case: if the source ends in `.js`, we omit that from the stored
    // source. We'll rely on code elsewhere to map an attempt to get `foo =
    // this()` to loading the module `foo = this().js`.
    this.source = source.endsWith(".js") ? source.slice(0, -3) : source;
  }

  async evaluate(environment) {
    if (this.expression) {
      // Constant or variable assignment
      return await execute(this.expression, environment);
    } else {
      // Variable pattern
      const { graph } = environment;
      return await graph.get(this.key);
    }
  }

  static parse(source) {
    // Try to parse the base key as a key.
    const { value: parsed, rest } = parse.key(source);
    if (!parsed || rest.length > 0) {
      // Unsuccessful parse
      if (source.includes("=")) {
        console.warn(`Formula: couldn't parse formula: ${source}`);
      }
      return null;
    }
    if (parsed[0] === ops.variable) {
      // Variable pattern
      const [_, variable, extension] = parsed;
      return new VariableFormula(variable, extension, null, source);
    } else if (parsed[0] === "=") {
      // Assignment
      const [_, left, expression] = parsed;
      if (left[0] === ops.variable) {
        // Variable assignment
        const [_, variable, extension] = left;
        return new VariableFormula(variable, extension, expression, source);
      } else {
        // Constant assignment
        return new ConstantFormula(left, expression, source);
      }
    }
    return undefined;
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

  constructor(variable, extension, expression, source) {
    const key = `{${variable}}${extension ?? ""}`;
    super(key, expression, source);
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
    // without an extension.
    if (!this.antecedents || this.extension === null) {
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
    if (key.includes("=") || key === additionsKey) {
      // Formulas and the additions key don't match extensions.
      return null;
    } else if (extension) {
      // Key matches if it ends with the same extension
      if (key.length > extension.length && key.endsWith(extension)) {
        return key.substring(0, key.length - extension.length);
      }
    } else if (!key.includes(".")) {
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
