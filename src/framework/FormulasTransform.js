import {
  ConstantFormula,
  default as Formula,
  VariableFormula,
} from "./Formula.js";

const formulasKey = Symbol("formulas");

export default function FormulasTransform(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this.applyFormulas = true;
      this.bindings = null;
      this[formulasKey] = null;
    }

    async evaluateFormula(formula, key) {
      const keyBinding = formula.unify(key);
      let value;
      const formulaApplies =
        keyBinding !== null && (!this.isInScope || formula.foundInScope);
      if (formulaApplies) {
        // Add the formula's key binding to the graph's bindings.
        const bindings = Object.assign(
          {},
          formula.closure,
          this.bindings,
          keyBinding
        );

        // Extend the graph with the full bindings.
        const graph = Object.create(this);
        graph.bindings = bindings;

        // Evaluate the formula.
        value = await formula.evaluate(graph);

        if (value instanceof Object && "bindings" in value) {
          // Give the subgraph the complete bindings.
          value.bindings = bindings;
        }
      }
      return value;
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
      if (!this[formulasKey]) {
        this[formulasKey] = [];
        await this.getKeys();
      }
      return this[formulasKey];
    }

    async get(key) {
      // See if we have a binding for this key.
      // This is effectively composing the bindings on top of this graph.
      let value = this.bindings?.[key];

      if (value === undefined) {
        // See if real value exists.
        value = await super.get(key);
      }

      let formulas;
      if (value === undefined && this.applyFormulas) {
        // No real value defined; try our formulas.
        formulas = await this.formulas();
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
      // Sort by precedence: constant formulas before variable formulas.
      sortFormulas(this[formulasKey]);
    }

    async keyAdded(key, options, existingKeys) {
      const result = (await super.keyAdded?.(key, options, existingKeys)) ?? {};
      // Try to parse the key as a formula.
      const formula = Formula.parse(String(key));
      if (formula) {
        // Successfully parsed key as a formula.
        const source = options.source ?? this;
        formula.closure = source.bindings ?? {};
        this[formulasKey].push(formula);

        // Add keys that this formula implies based on the existing keys.
        for (const impliedKey of formula.impliedKeys(existingKeys)) {
          this.addKey(impliedKey);
        }

        // Hide the formula from the keys.
        result.hidden = true;
      }
      return result;
    }

    async keysAdded(keys) {
      await super.keysAdded?.(keys);
      for (const formula of this[formulasKey]) {
        for (const key of formula.impliedKeys(keys)) {
          this.addKey(key);
        }
      }
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
      super.onChange?.(key);
      this[formulasKey] = null;
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

// Sort constant formulas before variable formulas.
// This sort is stable.
export function sortFormulas(formulas) {
  formulas.sort((a, b) => {
    if (a instanceof ConstantFormula && b instanceof VariableFormula) {
      return -1;
    } else if (b instanceof ConstantFormula && a instanceof VariableFormula) {
      return 1;
    } else {
      return 0;
    }
  });
}
