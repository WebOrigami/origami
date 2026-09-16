import { isPlainObject, isUnpackable } from "@weborigami/async-tree";

/**
 * Unpack a function's top-level arguments.
 *
 * Any the top-level packed arguments will be unpacked, as well as any packed
 * top-level properties of any arguments that plain objects.
 *
 * @param {...any} args
 * @returns {Promise<Array>}
 */
export default async function unpackArguments(...args) {
  return Promise.all(
    args.map((arg) => {
      if (isUnpackable(arg)) {
        return arg.unpack();
      } else if (isPlainObject(arg)) {
        return unpackPlainObject(arg);
      } else {
        return arg;
      }
    }),
  );
}

async function unpackPlainObject(object) {
  const entries = Object.entries(object);
  const processedEntries = await Promise.all(
    entries.map(async ([key, value]) => {
      if (isUnpackable(value)) {
        value = await value.unpack();
      }
      return [key, value];
    }),
  );
  return Object.fromEntries(processedEntries);
}
