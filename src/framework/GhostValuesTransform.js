import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
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
        const ghostKey = `${key}${ghostGraphExtension}`;
        let ghostGraphs = [];

        // See if ghost key itself exists.
        const ghostValue = await this.get(ghostKey);
        if (ghostValue !== undefined) {
          ghostGraphs.push(ghostValue);
        }
        
        // Add ghost graphs from local formulas.
        // TODO: prevent duplication of above ghostValue.
        const ghostResults = await this.formulaResults?.(ghostKey);
        if (ghostResults) {
          ghostGraphs = ghostGraphs.concat(ghostResults);
        }

        if (!('ghostGraphs' in value)) {
          value = transformObject(GhostValuesTransform, value);
        }

        value.ghostGraphs = ghostGraphs;
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
