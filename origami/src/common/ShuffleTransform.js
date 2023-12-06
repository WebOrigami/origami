/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function ShuffleTransform(Base) {
  return class Shuffle extends Base {
    async keys() {
      const keys = Array.from(await super.keys());
      shuffle(keys);
      return keys;
    }
  };
}

/*
 * Shuffle an array.
 *
 * Performs a Fisher-Yates shuffle. From http://sedition.com/perl/javascript-fy.html
 */
function shuffle(array) {
  var i = array.length;
  while (--i >= 0) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
