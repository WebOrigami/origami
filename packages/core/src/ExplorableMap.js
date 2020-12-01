import { get, keys } from "@explorablegraph/symbols";
import Explorable from "./Explorable.js";

export default class ExplorableMap extends Explorable {
  /**
   * @param {Map} map
   */
  constructor(map) {
    super();
    this.map = map;
  }

  /**
   * Return the value at the corresponding path of keys.
   *
   * @param {any[]} keys
   */
  [get](...keys) {
    if (keys.length === 0) {
      return this;
    }
    const [key, ...rest] = keys;
    const value = this.map.get(key);
    return value instanceof Explorable ? value[get](...rest) : value;
  }

  [keys]() {
    return this.map.keys()[Symbol.iterator]();
  }
}
