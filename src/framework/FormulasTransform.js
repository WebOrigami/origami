import { sortNatural } from "../core/utilities.js";
import {
  ConstantFormula,
  default as Formula,
  VariableFormula,
} from "./Formula.js";

const formulasKey = Symbol("formulas");
const inheritedFormulas = Symbol("inheritedFormulas");
const keysKey = Symbol("keys");
const realKeys = Symbol("realKeys");

export default function FormulasTransform(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this.applyFormulas = true;
      this.bindings = null;
      this[formulasKey] = null;
      this[inheritedFormulas] = null;
      this[keysKey] = null;
      this[realKeys] = null;
    }

    async *[Symbol.asyncIterator]() {
      if (!this[keysKey]) {
        // Start with the set of real keys.
        const realKeys = await this.realKeys();
        const keys = new Set(realKeys);

        // Generate the set of implied virtual keys in multiple passes until a
        // pass produces no new virtual keys.
        const formulas = await this.formulas();
        for (let size = 0; size !== keys.size; ) {
          size = keys.size;
          // Ask each formula to add any implied keys.
          for await (const formula of formulas) {
            formula.addImpliedKeys(keys);
          }
        }

        // Store keys in natural sort order.
        this[keysKey] = sortNatural([...keys]);
      }
      yield* this[keysKey];
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
        const formulas = await this.getFormulas();
        // Sort by precedence: constant formulas before variable formulas.
        sortFormulas(formulas);
        this[formulasKey] = formulas;
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

    async getFormulas() {
      const formulas = (await super.getFormulas?.()) ?? [];
      for await (const key of super[Symbol.asyncIterator]()) {
        // Try to parse the key as a formula.
        const formula = Formula.parse(String(key));
        if (formula) {
          // Successfully parsed key as a formula.
          formula.closure = this.bindings ?? {};
          formulas.push(formula);
        }
      }
      return formulas;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      super.onChange?.(key);
      this[formulasKey] = null;
      this[keysKey] = null;
      this[realKeys] = null;
    }

    async realKeys() {
      const keys = [];
      if (!this[realKeys]) {
        for await (const key of super[Symbol.asyncIterator]()) {
          if (!Formula.isFormula(key)) {
            keys.push(key);
          }
        }
        this[realKeys] = keys;
      }
      return this[realKeys];
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
