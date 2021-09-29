import ExplorableGraph from "../core/ExplorableGraph.js";
import builtins from "../eg/builtins.js";
import Formula from "./Formula.js";

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
        const bindings = formula.unify(key);
        if (bindings) {
          // Formula applies to this key.
          let value = await formula.evaluate(this.scope, this, bindings);
          if (value !== undefined) {
            return ExplorableGraph.isExplorable(value) && rest.length > 0
              ? await value.get(...rest)
              : typeof value === "function"
              ? value(...rest)
              : value;
          }
        }
      }
    }

    async #refresh() {
      this.#keys = [];
      this.#formulas = [];
      for await (const key of super[Symbol.asyncIterator]()) {
        // Try to parse the key as a formula.
        const formula = Formula.parse(key);
        if (formula) {
          // Successfully parsed key as a formula.
          this.#formulas.push(formula);
          this.#keys.push(formula.key);
        } else {
          this.#keys.push(key);
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
