import { default as Formula } from "./Formula.js";

const formulasKey = Symbol("formulas");

export default function FormulasTransform(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this.applyFormulas = true;
      this[formulasKey] = null;
    }

    async evaluateFormula(formula, key) {
      return key === formula.key
        ? await formula.evaluate(this) // Evaluate the formula.
        : undefined;
    }

    // Return all results for the given key.
    async formulaResults(key) {
      const formulas = await this.formulas();
      const results = await Promise.all(
        formulas.map(async (formula) => this.evaluateFormula(formula, key))
      );
      const definedResults = results.filter((result) => result !== undefined);
      return definedResults;
    }

    async formulas() {
      // HACK: If we've already computed the formulas, we should be able to skip
      // the call to ensureKeys(). However, it appears there are cases where the
      // formulas are computed as an empty array, but calling ensureKeys() again
      // populates the formulas. Needs investigation.
      if (this[formulasKey] === null || this[formulasKey].length === 0) {
        await this.ensureKeys();
      }
      return this[formulasKey];
    }

    async get(key) {
      // See if real value exists.
      let value = await super.get(key);

      if (value === undefined && this.applyFormulas) {
        // No real value defined; try our formulas.
        const formulas = await this.formulas();
        for (const formula of formulas) {
          value = await this.evaluateFormula(formula, key);
          if (value !== undefined) {
            // Found a formula that returned a defined value; return it.
            break;
          }
        }
      }

      return value;
    }

    async getKeys() {
      this[formulasKey] = [];
      await super.getKeys();
    }

    async keyAdded(key, options, existingKeys) {
      const result = (await super.keyAdded?.(key, options, existingKeys)) ?? {};
      // Try to parse the key as a formula.
      const formula = Formula.parse(String(key));
      if (formula) {
        // Successfully parsed key as a formula.
        this[formulasKey].push(formula);

        // Add the key that this formula implies.
        this.addKey(formula.key);

        // Hide the formula from the keys.
        result.hidden = true;
      }
      return result;
    }

    async matchAll(key) {
      const formulas = await this.formulas();
      const matches = [];
      // If we ever decide we want to parallelize the set of async calls here,
      // we'll need to make sure we keep them in the same order as the formulas.
      for (const formula of formulas) {
        const match = await this.evaluateFormula(formula, key);
        if (match) {
          matches.push(match);
        }
      }
      return matches;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      this[formulasKey] = null;
      super.onChange?.(key);
    }
  };
}

export function isFormulasTransformApplied(obj) {
  // Walk up prototype chain looking for a constructor called Formulas, which is
  // what is added by FormulasTransform.
  for (let proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
    if (proto.constructor.name === "Formulas") {
      return true;
    }
  }
  return false;
}
