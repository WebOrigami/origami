import equals from "./@equals.js";
import ifBuiltin from "./@if.js";
import * as math from "./@math.js";
import not from "./@not.js";
import or from "./@or.js";

const entries = {
  ...math,
  equals,
  if: ifBuiltin,
  not,
  or,
};

export default function calc(key) {
  return entries[key];
}
