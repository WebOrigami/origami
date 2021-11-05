import ExplorableGraph from "../core/ExplorableGraph.js";
import builtins from "../eg/builtins.js";
import Formula from "./Formula.js";

export default function FormulasMixin(Base) {
  return class Formulas extends Base {
    #bindings;
    #context = this;
    #formulas;
    #keys;
    #scope = builtins;

    async *[Symbol.asyncIterator]() {
      if (!this.#keys) {
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
        this.#keys = [...keys];
        this.#keys.sort();
      }
      yield* this.#keys;
    }

    get bindings() {
      return this.#bindings;
    }
    set bindings(bindings) {
      this.#bindings = bindings;
    }

    get context() {
      return this.#context;
    }
    set context(context) {
      this.#context = context;
    }

    async formulas() {
      if (!this.#formulas) {
        // Find all formulas in this graph.
        this.#formulas = [];
        for await (const key of super[Symbol.asyncIterator]()) {
          // Try to parse the key as a formula.
          const formula = Formula.parse(key);
          if (formula) {
            // Successfully parsed key as a formula.
            this.#formulas.push(formula);
          }
        }
      }
      return this.#formulas;
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
              value = ExplorableGraph.isExplorable(value)
                ? await value.get(...rest)
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

      // If we're returning a subgraph of the same type as us, give it our
      // scope.
      // TODO: Maybe do duck typing and do this for any subgraph that defines
      // a scope property?
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
      this.#formulas = null;
      this.#keys = null;
    }

    get scope() {
      return this.#scope;
    }
    set scope(scope) {
      this.#scope = scope;
    }
  };
}
