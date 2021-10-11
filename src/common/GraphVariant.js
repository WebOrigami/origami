import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import { isPlainObject } from "../core/utilities.js";

class ExplorableGraphPlus {
  static from() {}

  static async toJson(value) {
    if (typeof value === "string") {
      return value;
    }
    // plain should get access to graph.obj, can return that immediately for ExplorableObject
    const obj = isPlainObject(value)
      ? value
      : await ExplorableGraph.plain(value);
    return JSON.stringify(obj, null, 2);
  }

  static parse(value) {
    if (typeof value === "string" || ExplorableGraph.isExplorable(value)) {
      return value;
    }
    const obj = YAML.parse(value);
    return new ExplorableObject(obj);
  }

  static async textForKey(key) {}

  static async toYaml() {}
}
