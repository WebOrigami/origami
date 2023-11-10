import { naturalSortCompareFn } from "../utilities.js";
import sort from "./sort.js";

/**
 * Return a transform function that sorts a tree's keys using [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 */
export default function createSortNaturalTransform() {
  return sort(naturalSortCompareFn);
}
