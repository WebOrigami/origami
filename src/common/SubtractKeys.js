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
    let originalValue = await this.#original.get(...keys);
    const removeValue = await this.#remove.get(...keys);
    if (ExplorableGraph.isExplorable(originalValue)) {
      if (ExplorableGraph.isExplorable(removeValue)) {
        originalValue = new SubtractKeys(originalValue, removeValue);
      }
    } else if (removeValue !== undefined) {
      originalValue = undefined;
    }

    return originalValue;
  }
}
