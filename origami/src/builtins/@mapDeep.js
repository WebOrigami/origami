import { isPlainObject } from "@weborigami/async-tree";
import treeMap from "./@map.js";

export default function mapDeep(param1, param2) {
  // Identify whether the valueMap/options are the first parameter
  // or the second.
  let source;
  let options;
  if (param2 === undefined) {
    options = param1;
  } else {
    source = param1;
    if (isPlainObject(param2)) {
      options = param2;
    } else {
      options = { valueMap: param2 };
    }
  }

  options.deep = true;
  return treeMap(source, options);
}
