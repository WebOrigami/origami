import ExplorableObject from "../core/ExplorableObject.js";

export default class MetaGraph {
  constructor(meta, target) {
    this.meta = ExplorableObject.explore(meta);
    this.target = ExplorableObject.explore(target);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.meta[Symbol.asyncIterator]();
  }

  async get(...keys) {
    const value = await this.meta.get(...keys);
    const isLink = typeof value === "string" && value.startsWith("$graph/");
    if (isLink) {
      // Remove `$graph/` and get path parts.
      const path = value.slice(7).split("/");
      const targetValue = await this.target.get(path);
      return targetValue;
    } else {
      return value;
    }
  }
}
