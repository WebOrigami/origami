import Compose from "../common/Compose.js";

export default class ComposeFallbacks extends Compose {
  async formulas() {
    const result = [];
    for (const graph of this.graphs) {
      const formulas = (await graph.formulas?.()) ?? [];
      result.push(...formulas);
    }
    return result;
  }
}
