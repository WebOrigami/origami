export const call = Symbol("Explorable.call");

export default class Explorable {
  /**
   * Invoke an explorable object as a function.
   *
   * @param {any} obj
   * @param  {...any} args
   * @returns {any}
   */
  static call(obj, ...args) {
    return (
      // Explorable object or
      obj[call]?.(...args) ??
      // Assumed to be a function.
      obj(...args)
    );
  }
}
