import equals from "./@equals.js";
import ifBuiltin from "./@if.js";
import * as math from "./@math.js";
import not from "./@not.js";
import or from "./@or.js";

export default {
  ...math,
  equals,
  if: ifBuiltin,
  not,
  or,
};
