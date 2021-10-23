import ExplorableGraph from "../core/ExplorableGraph.js";

export default class SubtractKeys {
  #original;
  #remove;

  constructor(original, remove) {
    this.#original = ExplorableGraph.from(original);
    this.#remove = ExplorableGraph.from(remove);
  }

  async *[Symbol.asyncIterator]() {
    for await (const key of this.#original) {
      const removeResult = await this.#remove.get(key);
      if (
        removeResult === undefined ||
        ExplorableGraph.isExplorable(removeResult)
      ) {
        yield key;
      }
    }
  }

  async get(...keys) {
    let result = await this.#original.get(...keys);
    if (ExplorableGraph.isExplorable(result)) {
      const removeResult = await this.#remove.get(...keys);
      if (ExplorableGraph.isExplorable(removeResult)) {
        result = new SubtractKeys(result, removeResult);
      }
    }

    return result;
  }
}
