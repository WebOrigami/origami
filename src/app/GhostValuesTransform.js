import ExplorableGraph from "../core/ExplorableGraph.js";
import Formula from "./Formula.js";
import { sortFormulas } from "./FormulasTransform.js";

export const ghostGraphExtension = "+";

export default function GhostValuesTransform(Base) {
  return class GhostValues extends Base {
    constructor(...args) {
      super(...args);
      this.ghostGraphs = [];
    }

    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
      for (const graph of this.ghostGraphs) {
        for await (const key of graph) {
          if (!Formula.isFormula(key)) {
            yield key;
          }
        }
      }
    }

    async get(key) {
      // Try local graph first.
      let value = await super.get(key);
      if (value === undefined) {
        // Wasn't found in local graph, try ghost graphs.
        for (const graph of this.ghostGraphs) {
          value = await graph.get(key);
          if (value !== undefined) {
            break;
          }
        }
      } else if (ExplorableGraph.isExplorable(value) && !isGhostKey(key)) {
        // Add ghost graphs from local formulas.
        const ghostKey = `${key}${ghostGraphExtension}`;
        value.ghostGraphs = await this.formulaResults(ghostKey);
      }
      return value;
    }

    async localFormulas() {
      // Start with super formulas, if any.
      const formulas = (await super.localFormulas?.()) ?? [];
      // Add formulas from ghost graphs, if any.
      const ghostGraphs = this.ghostGraphs ?? [];
      for (const ghostGraph of ghostGraphs) {
        const ghostFormulas = (await ghostGraph.localFormulas?.()) ?? [];
        formulas.push(...ghostFormulas);
      }
      sortFormulas(formulas);
      return formulas;
    }
  };
}

function isGhostKey(key) {
  return key.endsWith(ghostGraphExtension);
}
