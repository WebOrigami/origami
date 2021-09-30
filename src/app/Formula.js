import execute from "../eg/execute.js";
import * as opcodes from "../eg/opcodes.js";
import * as parse from "../eg/parse.js";

export default class Formula {
  key;
  expression;

  constructor(key, expression) {
    this.key = key;
    this.expression = expression;
  }

  async evaluate(scope, graph, bindings) {
    if (this.expression) {
      // Constant or variable assignment
      const bound = bind(this.expression, bindings);
      const value = await execute(bound, scope, graph);
      return value;
    } else {
      // Variable pattern
      const value = await graph.get(this.key);
      return value;
    }
  }

  static parse(text) {
    // Try to parse the base key as a key.
    const { value: parsed, rest } = parse.key(text);
    if (!parsed || rest.length > 0) {
      // Unsuccessful parse
      return null;
    }
    if (parsed[0] === opcodes.variableValue) {
      // Variable pattern
      const [_, variable, extension] = parsed;
      return new VariableFormula(variable, extension, null);
    } else if (parsed[0] === "=") {
      // Assignment
      const [_, left, expression] = parsed;
      if (left[0] === opcodes.variableValue) {
        // Variable assignment
        const [_, variable, extension] = left;
        return new VariableFormula(variable, extension, expression);
      } else {
        // Constant assignment
        return new ConstantFormula(left, expression);
      }
    }
    return undefined;
  }
}

function bind(expression, bindings) {
  if (Object.keys(bindings).length === 0) {
    // Nothing to bind
    return expression;
  } else if (!(expression instanceof Array)) {
    // Scalar values don't need binding.
    return expression;
  } else if (expression[0] === opcodes.variableValue) {
    // Found a reference to a variable, return the bound value instead.
    const [_, name, extension] = expression;
    const bound = bindings[name] + (extension ?? "");
    return bound;
  } else {
    // Regular array; bind each of its elements.
    return expression.map((item) => bind(item, bindings));
  }
}

class ConstantFormula extends Formula {
  addImpliedKeys(keys) {
    // Constant formulas add the name of the constant they define.
    keys.add(this.key);
  }

  unify(key) {
    return this.key === key ? {} : null;
  }
}

class VariableFormula extends Formula {
  variable;
  extension;
  antecedents;

  constructor(variable, extension, expression) {
    const key = `{${variable}}${extension ?? ""}`;
    super(key, expression);
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
    } else if (expression[0] === opcodes.variableValue) {
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
    if (extension) {
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
