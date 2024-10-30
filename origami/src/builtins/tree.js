import { Tree } from "@weborigami/async-tree";
import addNextPrevious from "./@addNextPrevious.js";
import clean from "./@clean.js";
import copy from "./@copy.js";
import json from "./@json.js";
import keys from "./@keys.js";
import map from "./@map.js";
import paginate from "./@paginate.js";
import reverse from "./@reverse.js";

const entries = {
  ...Tree,
  addNextPrevious,
  clean,
  copy,
  json,
  keys,
  map,
  paginate,
  reverse,
};

export default function tree(key) {
  return entries[key];
}
