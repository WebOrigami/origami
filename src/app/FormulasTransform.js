import {
  ConstantFormula,
  default as Formula,
  VariableFormula,
} from "./Formula.js";

const formulasKey = Symbol("formulas");
const localFormulasKey = Symbol("localFormulas");
const keysKey = Symbol("keys");

export default function FormulasTransform(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this.bindings = null;
      this[formulasKey] = null;
      this[keysKey] = null;
      this[localFormulasKey] = null;
    }

    async *[Symbol.asyncIterator]() {
      if (!this[keysKey]) {
        const keys = new Set();
        for await (const key of super[Symbol.asyncIterator]()) {
          keys.add(key);
        }

        // Cooperate with AdditionsTransform: if the graph has addition, add the
        // addition's keys to the graph's keys. We wouldn't normally pick those
        // up, because MetaTransform applies AdditionsTransform after FormulasTransform. (If
        // someone applies the mixins in the opposite, the addition's keys will
        // already have been picked up by the iterator above, but it won't hurt
        // anything to add them to the set again.)
        const additions = await this.additions?.();
        if (additions) {
          for await (const key of additions) {
            keys.add(key);
          }
        }

        // Generate the set of implied keys in multiple passes until a pass
        // produces no new implied keys.
        for (let size = 0; size !== keys.size; ) {
          size = keys.size;
          // Ask each *local* formula to add any implied keys.
          const formulas = await this.localFormulas();
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

    // TODO: Reconcile this name with localFormulas,
    // would be better if other transforms could define `formulas`.
    async formulas() {
      if (!this[formulasKey]) {
        this[formulasKey] = await this.localFormulas();
      }
      return this[formulasKey];
    }

    async localFormulaMatches(key) {
      // See if we have a formula that can produce the desired key.
      const formulas = await this.localFormulas();
      const matches = [];
      for (const formula of formulas) {
        const keyBinding = formula.unify(key);
        const formulaApplies =
          keyBinding !== null && (!this.isInScope || formula.foundInScope);
        if (formulaApplies) {
          // Add our formula's key binding to the graph's bindings.
          const bindings = Object.assign(
            {},
            formula.closure,
            this.bindings,
            keyBinding
          );

          // Extend the graph with the full bindings.
          const graph = Object.create(this);
          graph.bindings = bindings;

          const value = await formula.evaluate(graph);

          if (value instanceof Object && "bindings" in value) {
            // Give the subgraph our complete bindings.
            value.bindings = bindings;
          }

          if (value !== undefined) {
            matches.push(value);
          }
        }
      }
      return matches;
    }

    async get(key) {
      // See if real value exists.
      let value = await super.get(key);

      // See if we have a formula that can produce the desired key.
      if (value === undefined) {
        // No real value defined; try our formulas.
        const formulas = await this.formulas();
        for (const formula of formulas) {
          const keyBinding = formula.unify(key);
          const formulaApplies =
            keyBinding !== null && (!this.isInScope || formula.foundInScope);
          if (formulaApplies) {
            // Add our formula's key binding to the graph's bindings.
            const bindings = Object.assign(
              {},
              formula.closure,
              this.bindings,
              keyBinding
            );

            // Extend the graph with the full bindings.
            const graph = Object.create(this);
            graph.bindings = bindings;

            value = await formula.evaluate(graph);

            if (value instanceof Object && "bindings" in value) {
              // Give the subgraph our complete bindings.
              value.bindings = bindings;
            }

            if (value !== undefined) {
              // Found a formula that returned a defined value; return it.
              break;
            }
          }
        }
      }

      return value;
    }

    async localFormulas() {
      if (!this[localFormulasKey]) {
        // Find all formulas in this graph.
        const formulas = [];

        for await (const key of super[Symbol.asyncIterator]()) {
          // Try to parse the key as a formula.
          const formula = Formula.parse(String(key));
          if (formula) {
            // Successfully parsed key as a formula.
            formula.closure = this.bindings ?? {};
            formulas.push(formula);
          }
        }

        // Add formulas from ghost graphs, if present.
        const ghostGraphs = this.ghostGraphs ?? [];
        for (const ghostGraph of ghostGraphs) {
          const ghostFormulas = (await ghostGraph.localFormulas()) ?? [];
          formulas.push(...ghostFormulas);
        }

        // Sort constant formulas before variable formulas.
        formulas.sort((a, b) => {
          if (a instanceof ConstantFormula && b instanceof VariableFormula) {
            return -1;
          } else if (
            b instanceof ConstantFormula &&
            a instanceof VariableFormula
          ) {
            return 1;
          } else {
            return 0;
          }
        });

        this[localFormulasKey] = formulas;
      }
      return this[localFormulasKey];
    }

    // Reset memoized values when the underlying graph changes.
    onChange(eventType, filename) {
      super.onChange?.(eventType, filename);
      this[formulasKey] = null;
      this[localFormulasKey] = null;
      this[keysKey] = null;
    }
  };
}
