import helpRegistry from "../common/helpRegistry.js";
export default async function repeat(count, content) {
  const array = new Array(count);
  array.fill(content);
  return array;
}

helpRegistry.set(
  "origami:repeat",
  "(n, obj) - An array of n copies of the object"
);
