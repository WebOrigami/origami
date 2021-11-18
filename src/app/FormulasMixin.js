import {
  ConstantFormula,
  default as Formula,
  VariableFormula,
} from "./Formula.js";

const bindingsKey = Symbol("bindings");
const contextKey = Symbol("context");
const formulasKey = Symbol("formulas");
const keysKey = Symbol("keys");

export default function FormulasMixin(Base) {
  return class Formulas extends Base {
    constructor(...args) {
      super(...args);
      this[bindingsKey] = null;
      this[contextKey] = this;
      this[formulasKey] = null;
      this[keysKey] = null;
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
          const formula = Formula.parse(String(key));
          if (formula) {
            // Successfully parsed key as a formula.
            this[formulasKey].push(formula);
          }
        }

        // Sort constant formulas before variable formulas.
        this[formulasKey].sort((a, b) => {
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

        // Add fallback formulas.
        //
        // NOTE: The call to get fallbacks will cause FallbackMixin to get the
        // fallback key (`+`), which will cause FormulasMixin's `get` to ask for
        // formulas, creating the potential for a recursive loop. However, when
        // that inner `get` call asks for formulas, the `if` condition at the
        // top of this present formulas() method will see that this[formulasKey]
        // has already been set and return it immediately.
        //
        // This feels shaky, but does have the correct behavior. In particular,
        // the fallback key `+` can be defined with a formula -- but the
        // formulas that define it have to come from the local graph; they can't
        // come from fallbacks.
        const fallbacks = await this.fallbacks?.();
        if (fallbacks) {
          const fallbackFormulas = (await fallbacks.formulas?.()) ?? [];
          this[formulasKey].push(...fallbackFormulas);
        }
      }

      return this[formulasKey];
    }

    async get(key) {
      // See if real value exists.
      let value = await super.get(key);

      if (value === undefined) {
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
              context: this.context,
              graph: this,
              scope: this.scope ?? this,
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

    // Reset memoized values when the underlying graph changes.
    onChange(eventType, filename) {
      if (super.onChange) {
        super.onChange(eventType, filename);
      }
      this[formulasKey] = null;
      this[keysKey] = null;
    }
  };
}
