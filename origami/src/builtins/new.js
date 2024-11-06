import { isUnpackable } from "@weborigami/async-tree";

export default async function instantiate(constructor) {
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

instantiate.description = `Create an instance of a JavaScript class`;
