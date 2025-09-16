/**
 * Compare two strings using [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 */
const naturalOrder = new Intl.Collator(undefined, {
  numeric: true,
}).compare;

export default naturalOrder;
