import ExplorableGraph from "../core/ExplorableGraph.js";
import builtins from "../eg/builtins.js";
import execute from "../eg/execute.js";
import * as parse from "../eg/parse.js";

export default function FormulasMixin(Base) {
  return class Formulas extends Base {
    #keys;
    #formulas;
    #scope = builtins;

    async *[Symbol.asyncIterator]() {
      if (!this.#keys) {
        await this.#refresh();
      }
      yield* this.#keys;
    }

    async formulas() {
      if (!this.#formulas) {
        await this.#refresh();
      }
      return this.#formulas;
    }

    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }

      const [key, ...rest] = keys;
      const formulas = await this.formulas();
      for (const formula of formulas) {
        const bindings = unify(formula.left, key);
        if (bindings) {
          const scope = this.scope;
          const bound = bind(formula.right, bindings);
          const value = await execute(bound, scope, this);
          if (value !== undefined) {
            return ExplorableGraph.isExplorable(value) && rest.length > 0
              ? await value.get(...rest)
              : typeof value === "function"
              ? value()
              : value;
          }
        }
      }
    }

    async #refresh() {
      this.#keys = [];
      this.#formulas = [];
      for await (const baseKey of super[Symbol.asyncIterator]()) {
        // Try to parse the base key as an assignment.
        const { value: parsed, rest } = parse.assignment(baseKey);
        if (parsed !== undefined && rest.length === 0) {
          const left = parsed[1];
          const right = parsed[2];
          const formula = { left, right };
          this.#formulas.push(formula);
          if (isConstantFormula(formula)) {
            this.#keys.push(left);
          }
        } else {
          this.#keys.push(baseKey);
        }
      }

      // Store keys in JavaScript sort order.
      this.#keys.sort();
    }

    get scope() {
      return this.#scope;
    }
    set scope(scope) {
      this.#scope = scope;
    }
  };
}

function bind(expression, bindings) {
  if (!(expression instanceof Array)) {
    return expression;
  }
  if (expression[0] === parse.variableMarker) {
    const [_, name, suffix] = expression;
    const bound = bindings[name] + (suffix ?? "");
    return bound;
  }
  const mapped = expression.map((item) => bind(item, bindings));
  return mapped;
}

function isConstantFormula(formula) {
  return typeof formula.left === "string";
}

function unify(definition, key) {
  if (typeof definition === "string") {
    // Constant formula; simple case
    return definition === key ? {} : undefined;
  }
  const [marker, variable, suffix] = definition;
  if (marker !== parse.variableMarker) {
    return undefined;
  }
  // TODO: Rationalize with gen()
  const suffixLength = suffix?.length ?? 0;
  if (suffixLength < key.length && (suffix === null || key.endsWith(suffix))) {
    // Matched
    const value = key.substring(0, key.length - suffixLength);
    return { [variable]: value };
  }
  return undefined;
}
