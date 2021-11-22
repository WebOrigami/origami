import {
  ConstantFormula,
  default as Formula,
  VariableFormula,
} from "./Formula.js";

const formulasKey = Symbol("formulas");
const localFormulasKey = Symbol("localFormulas");
const keysKey = Symbol("keys");

export default function FormulasMixin(Base) {
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

        // Cooperate with AdditionsMixin: if the graph has addition, add the
        // addition's keys to the graph's keys. We wouldn't normally pick those
        // up, because MetaMixin applies AdditionsMixin after FormulasMixin. (If
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

    async formulas() {
      if (!this[formulasKey]) {
        // Start with local formulas.
        const localFormulas = await this.localFormulas();
        // Add inherited formulas.
        const inheritedFormulas = (await this.scope?.formulas?.()) ?? [];
        // Filter out inherited wildcards.
        const filtered = inheritedFormulas.filter(
          (formula) => !formula.isWildcard
        );
        this[formulasKey] = [...localFormulas, ...filtered];
      }
      return this[formulasKey];
    }

    async get(key) {
      // See if real value exists.
      let value = await super.get(key);

      // See if we have a formula that can produce the desired key. Skip this if
      // this call is happening because a subgraph is looking up its scope for
      // inherited values -- the subgraph's FormulasMixin will have already
      // considered all inherited formulas already.
      if (value === undefined && !this.isInScope) {
        // No real value defined; try our formulas.
        const formulas = await this.formulas();
        for (const formula of formulas) {
          const keyBinding = formula.unify(key);
          if (keyBinding) {
            // Formula applies to this key.

            // Add our formula's key binding to the graph's bindings.
            const bindings = Object.assign({}, this.bindings, keyBinding);

            value = await formula.evaluate({
              bindings,
              graph: this,
              thisKey: formula.source,
            });

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
            formulas.push(formula);
          }
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
