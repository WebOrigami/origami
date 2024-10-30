import { isUnpackable } from "@weborigami/async-tree";

const entries = {
  Array,
  Boolean,
  Date,
  Error,
  Infinity,
  Intl,
  JSON,
  Map,
  Math,
  NaN,
  new: instantiate,
  Number,
  Object,
  RegExp,
  Set,
  String,
  Symbol,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  false: false,
  isFinite,
  isNaN,
  null: null,
  parseFloat,
  parseInt,
  true: true,
  undefined: undefined,
};

export async function instantiate(constructor) {
  if (isUnpackable(constructor)) {
    constructor = await constructor.unpack();
  }
  // Origami may pass `undefined` as the first argument to the constructor. We
  // don't pass that along, because constructors like `Date` don't like it.
  return (...args) =>
    args.length === 1 && args[0] === undefined
      ? new constructor()
      : new constructor(...args);
}

export default function js(key) {
  return entries[key];
}
