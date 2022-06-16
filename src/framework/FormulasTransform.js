import { sortNatural } from "../core/utilities.js";
import {
  ConstantFormula,
  default as Formula,
  VariableFormula,
} from "./Formula.js";

const formulasKey = Symbol("formulas");
const keysKey = Symbol("keys");

export default function FormulasTransform(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this.bindings = null;
      this[formulasKey] = null;
      this[keysKey] = null;
    }

    async *[Symbol.asyncIterator]() {
      if (!this.listeningForChanges || !this[keysKey]) {
        const keys = new Set();
        for await (const key of super[Symbol.asyncIterator]()) {
          keys.add(key);
        }

        // Cooperate with AdditionsTransform: if the graph has addition, add the
        // addition's keys to the graph's keys. We wouldn't normally pick those
        // up, because MetaTransform applies AdditionsTransform after
        // FormulasTransform. (If someone applies the mixins in the opposite
        // order, the addition's keys will already have been picked up by the
        // iterator above, but it won't hurt anything to add them to the set
        // again.)
        const additions = await this.additions?.();
        if (additions) {
          for await (const key of additions) {
            keys.add(key);
          }
        }

        // Generate the set of implied keys in multiple passes until a pass
        // produces no new implied keys.
        const formulas = await this.localFormulas();
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
      // REVIEW: This isn't saving us much, because InheritScopeTransform is
      // overriding the formulas() method.
      if (!this.listeningForChanges || !this[formulasKey]) {
        this[formulasKey] = await this.localFormulas();
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

      if (value === undefined) {
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

    // Find all formulas in this graph.
    async localFormulas() {
      // Start with super formulas, if any.
      const formulas = (await super.localFormulas?.()) ?? [];
      // Loop over all keys.
      for await (const key of super[Symbol.asyncIterator]()) {
        // Try to parse the key as a formula.
        const formula = Formula.parse(String(key));
        if (formula) {
          // Successfully parsed key as a formula.
          formula.closure = this.bindings ?? {};
          formulas.push(formula);
        }
      }
      sortFormulas(formulas);
      return formulas;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(eventType, filename) {
      super.onChange?.(eventType, filename);
      this[formulasKey] = null;
      this[keysKey] = null;
    }
  };
}

export function isFormulasTransformApplied(obj) {
  // Walk up prototype chain looking for a constructor called FormulasTransform.
  for (let proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
    if (proto.constructor.name === "FormulasTransform") {
      return true;
    }
  }
  return false;
}

export function sortFormulas(formulas) {
  // Sort constant formulas before variable formulas.
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
