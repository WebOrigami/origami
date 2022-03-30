import Scope from "../common/Scope.js";
import { parentScope } from "../framework/scopeUtilities.js";

export default function IdentityGraph(graph) {
  const baseScope = parentScope(graph);
  return {
    async *[Symbol.asyncIterator]() {
      yield* graph;
    },

    async get(key) {
      return graph.get(key);
    },

    get scope() {
      return new Scope(this, baseScope);
    },
  };
}
