import execute from "../eg/execute.js";
import * as parse from "../eg/parse.js";

export default class Formula {
  key;
  expression;
  // antecedents;

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

  // impliedKeys(keys) {}

  static parse(text) {
    // Try to parse the base key as a key.
    const { value: parsed, rest } = parse.key(text);
    if (!parsed || rest.length > 0) {
      // Unsuccessful parse
      return null;
    }
    if (parsed[0] === parse.variableMarker) {
      // Variable pattern
      const [_, variable, extension] = parsed;
      return new VariableFormula(variable, extension, null);
    } else if (parsed[0] === "=") {
      // Assignment
      const [_, left, expression] = parsed;
      if (left[0] === parse.variableMarker) {
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
  } else if (expression[0] === parse.variableMarker) {
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
  unify(key) {
    return this.key === key ? {} : null;
  }
}

class VariableFormula extends Formula {
  variable;
  extension;

  constructor(variable, extension, expression) {
    const key = `{${variable}}${extension ?? ""}`;
    super(key, expression);
    this.variable = variable;
    this.extension = extension;
  }

  unify(key) {
    let value;
    if (this.extension) {
      // Key matches if it ends with the same extension
      if (key.endsWith(this.extension)) {
        value = key.substring(0, key.length - this.extension.length);
      }
    } else {
      // Key matches if it has no extension
      value = !key.includes(".") ? key : null;
    }
    return value ? { [this.variable]: value } : null;
  }
}
