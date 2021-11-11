import ExplorableGraph from "../core/ExplorableGraph.js";

const originalKey = Symbol("originalKey");
const removeKey = Symbol("removeKey");

export default class SubtractKeys {
  constructor(original, remove) {
    this[originalKey] = ExplorableGraph.from(original);
    this[removeKey] = ExplorableGraph.from(remove);
  }

  async *[Symbol.asyncIterator]() {
    for await (const key of this[originalKey]) {
      const removeResult = await this[removeKey].get(key);
      if (
        removeResult === undefined ||
        ExplorableGraph.isExplorable(removeResult)
      ) {
        yield key;
      }
    }
  }

  async get(...keys) {
    let originalValue = await this[originalKey].get(...keys);
    const removeValue = await this[removeKey].get(...keys);
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
