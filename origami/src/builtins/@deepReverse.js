import reverse from "./@reverse.js";

/**
 * Shorthand for reversing a tree with the `deep` option set to true.
 * 
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree

* @this {AsyncTree|null}
 * @param {*} treelike 
 */
export default function deepReverse(treelike) {
  return reverse.call(this, treelike, { deep: true });
}
