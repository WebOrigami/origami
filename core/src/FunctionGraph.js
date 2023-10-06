import FunctionDictionary from "./FunctionDictionary.js";

/**
 * Trivial subclass of FunctionDictionary, primarily to ensure consistency with
 * the other core graph classes.
 *
 * @typedef {import("@graphorigami/types").AsyncGraph} AsyncGraph
 * @implements {AsyncGraph}
 */
export default class FunctionGraph extends FunctionDictionary {}
