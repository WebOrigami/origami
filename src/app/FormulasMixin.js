import ExplorableGraph from "../core/ExplorableGraph.js";
import builtins from "../eg/builtins.js";
import Formula from "./Formula.js";

const bindingsKey = Symbol("bindings");
const contextKey = Symbol("context");
const formulasKey = Symbol("formulas");
const keysKey = Symbol("keys");
const scopeKey = Symbol("scope");

export default function FormulasMixin(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this[bindingsKey] = null;
      this[contextKey] = this;
      this[formulasKey] = null;
      this[keysKey] = null;
      this[scopeKey] = builtins;
    }

    async *[Symbol.asyncIterator]() {
      if (!this[keysKey]) {
        const keys = new Set();
        for await (const key of super[Symbol.asyncIterator]()) {
          keys.add(key);
        }

        // Generate the set of implied keys in multiple passes until a pass
        // produces no new implied keys.
        for (let size = 0; size !== keys.size; ) {
          size = keys.size;
          // Ask each formula to add any implied keys.
          const formulas = await this.formulas();
          for await (const formula of formulas) {
            formula.addImpliedKeys(keys);
          }
        }

        // Store keys in JavaScript sort order.
        this[keysKey] = [...keys];
        this[keysKey].sort();
      }
      yield* this[keysKey];
    }

    get bindings() {
      return this[bindingsKey];
    }
    set bindings(bindings) {
      this[bindingsKey] = bindings;
    }

    get context() {
      return this[contextKey];
    }
    set context(context) {
      this[contextKey] = context;
    }

    async formulas() {
      if (!this[formulasKey]) {
        // Find all formulas in this graph.
        this[formulasKey] = [];
        for await (const key of super[Symbol.asyncIterator]()) {
          // Try to parse the key as a formula.
          const formula = Formula.parse(key);
          if (formula) {
            // Successfully parsed key as a formula.
            this[formulasKey].push(formula);
          }
        }
      }
      return this[formulasKey];
    }

    async get(...keys) {
      // See if real value exists.
      let value = await super.get(...keys);

      if (value === undefined) {
        // No real value defined; try our formulas.
        const [key, ...rest] = keys;
        const formulas = await this.formulas();
        for (const formula of formulas) {
          const keyBinding = formula.unify(key);
          if (keyBinding) {
            // Formula applies to this key.

            // Add our formula's key binding to the graph's bindings.
            const bindings = Object.assign({}, this.bindings, keyBinding);

            value = await formula.evaluate({
              bindings,
              context: this.context,
              graph: this,
              scope: this.scope,
              thisKey: formula.source,
            });

            if (value instanceof Object && "bindings" in value) {
              // Give the subgraph our complete bindings.
              value.bindings = bindings;
            }

            if (rest.length > 0) {
              // If there are more keys to get, do that.
              value = ExplorableGraph.canCastToExplorable(value)
                ? await ExplorableGraph.from(value).get(...rest)
                : typeof value === "function"
                ? value(...rest)
                : undefined;
            }

            if (value !== undefined) {
              // Found a formula that returned a defined value; return it.
              break;
            }
          }
        }
      }

      // If the result has a scope, set it to our scope.
      if (value instanceof Object && "scope" in value) {
        value.scope = this.scope;
      }

      return value;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(eventType, filename) {
      if (super.onChange) {
        super.onChange(eventType, filename);
      }
      this[formulasKey] = null;
      this[keysKey] = null;
    }

    get scope() {
      return this[scopeKey];
    }
    set scope(scope) {
      this[scopeKey] = scope;
    }
  };
}
