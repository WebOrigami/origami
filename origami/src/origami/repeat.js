import { args } from "@weborigami/async-tree";

/**
 * Return an array of a given length, filled with the given value.
 *
 * @param {number} count
 * @param {any} value
 */
export default async function repeat(count, value) {
  count = args.number(count, "Origami.repeat");
  const array = new Array(count);
  array.fill(value);
  return array;
}
