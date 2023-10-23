import FunctionDictionary from "./FunctionDictionary.js";

/**
 * Trivial subclass of FunctionDictionary, primarily to ensure consistency with
 * the other core tree classes.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class FunctionTree extends FunctionDictionary {
  constructor(fn, domain) {
    super(fn, domain);
    this.parent2 = null;
  }
}
