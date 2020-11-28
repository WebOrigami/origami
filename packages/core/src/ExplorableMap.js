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
   * Return the value for the corresponding key.
   *
   * @param {any} key
   */
  [get](key) {
    return this.map.get(key);
  }

  [keys]() {
    return this.map.keys()[Symbol.iterator]();
  }
}
