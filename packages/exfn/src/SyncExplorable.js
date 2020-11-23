import Explorable from "./Explorable.js";

export default class SyncExplorable extends Explorable {
  /**
   * Returns the keys for a sync explorable.
   *
   * @param {any} exfn
   */
  static keys(exfn) {
    return [...exfn];
  }
}
