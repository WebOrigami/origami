import Compose from "../common/Compose.js";

/**
 * A composed graph that will be used to obtain formulas. This is used by
 * FallbackMixin to compose the graph of inherited fallbacks.
 */
export default class ComposeFallbacks extends Compose {
  // Return the formulas from all the graphs in the composition.
  async formulas() {
    const result = [];
    for (const graph of this.graphs) {
      const formulas = (await graph.formulas?.()) ?? [];
      result.push(...formulas);
    }
    return result;
  }
}
