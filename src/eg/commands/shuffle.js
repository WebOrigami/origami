import ExplorableGraph from "../../core/ExplorableGraph.js";

export default function shuffle(variant) {
  const graph = ExplorableGraph.from(variant);
  return {
    async *[Symbol.asyncIterator]() {
      const keys = await ExplorableGraph.keys(graph);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        // Pick a random index from the remaining keys.
        const index = Math.floor(Math.random() * keys.length);
        const key = keys[index];
        // Remove the key from the remaining keys.
        keys.splice(index, 1);
        yield key;
      }
    },

    async get(key, ...rest) {
      let value = await graph.get(key);
      if (ExplorableGraph.isExplorable(value)) {
        value = shuffle(value);
        if (rest.length > 0) {
          value = await value.get(...rest);
        }
      }
      return value;
    },
  };
}

shuffle.usage = `shuffle(graph)\tReturn a new graph with the original's keys shuffled`;
