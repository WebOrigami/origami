import ExplorableGraph from "../core/ExplorableGraph.js";

// export function StringsMixin(Base) {
//   return class Strings extends Base {
//     async get(...keys) {
//       const value = await super.get(...keys);
//       return ExplorableGraph.isExplorable(value) ? value : value?.toString?.();
//     }
//   };
// }

export default function strings(graph) {
  return {
    async *[Symbol.asyncIterator]() {
      yield* graph[Symbol.asyncIterator]();
    },

    async get(...keys) {
      const value = await graph.get(...keys);
      return ExplorableGraph.isExplorable(value)
        ? strings(value)
        : value?.toString?.();
    },
  };
}
