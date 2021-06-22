import parse from "../eg/parse.js";

export default function FormulasMixin(Base) {
  return class Formulas extends Base {
    #keys;
    #formulas;

    async *[Symbol.asyncIterator]() {
      if (!this.#keys) {
        await this.refresh();
      }
      yield* this.#keys;
    }

    async formulas() {
      if (!this.#formulas) {
        await this.refresh();
      }
      return this.#formulas;
    }

    async refresh() {
      this.#keys = [];
      this.#formulas = {};
      for await (const baseKey of super[Symbol.asyncIterator]()) {
        // Try to parse the base key as an expression.
        const parsed = parse(baseKey);
        const isFormula = parsed instanceof Array && parsed[0] === "=";
        if (isFormula) {
          const key = parsed[1];
          const value = parsed[2];
          this.#formulas[key] = value;
          this.#keys.push(key);
        } else {
          this.#keys.push(baseKey);
        }
      }

      // Store keys in JavaScript sort order.
      this.#keys.sort();
    }
  };
}
