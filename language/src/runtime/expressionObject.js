import {
  extension,
  ObjectTree,
  symbols,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import { handleExtension } from "./handlers.js";
import { evaluate, ops } from "./internal.js";
import { traceJavaScriptFunction } from "./trace.js";

/**
 * Given an array of entries with string keys and Origami code values (arrays of
 * ops and operands), return an object with the same keys defining properties
 * whose getters evaluate the code.
 *
 * The value can take three forms:
 *
 * 1. A primitive value (string, etc.). This will be defined directly as an
 *    object property.
 * 1. An eager (as opposed to lazy) code entry. This will be evaluated during
 *    this call and its result defined as an object property.
 * 1. A code entry that starts with ops.getter. This will be defined as a
 *    property getter on the object.
 *
 * @param {*} entries
 * @param {import("@weborigami/types").AsyncTree | null} parent
 */
export default async function expressionObject(entries, parent) {
  // Create the object and set its parent
  const object = {};
  if (parent !== null && !Tree.isAsyncTree(parent)) {
    throw new TypeError(`Parent must be an AsyncTree or null`);
  }

  let tree;
  const propertyIsEager = {};
  const propertyIsEnumerable = {};
  for (let [key, value] of entries) {
    // Determine if we need to define a getter or a regular property. If the key
    // has an extension, we need to define a getter. If the value is code (an
    // array), we need to define a getter -- but if that code takes the form
    // [ops.getter, <primitive>] or [ops.literal, <value>], we can define a
    // regular property.
    let defineProperty;
    const extname = extension.extname(key);
    if (extname) {
      defineProperty = false;
    } else if (!(value instanceof Array)) {
      defineProperty = true;
    } else if (value[0] === ops.getter && !(value[1] instanceof Array)) {
      defineProperty = true;
      value = value[1];
    } else if (value[0] === ops.literal) {
      defineProperty = true;
      value = value[1];
    } else {
      defineProperty = false;
    }

    // If the key is wrapped in parentheses, it is not enumerable.
    let enumerable = true;
    if (key[0] === "(" && key[key.length - 1] === ")") {
      key = key.slice(1, -1);
      enumerable = false;
    }
    propertyIsEnumerable[key] = enumerable;

    if (defineProperty) {
      // Define simple property
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable,
        value,
        writable: true,
      });
    } else {
      // Property getter
      let code;
      if (value[0] === ops.getter) {
        code = value[1];
      } else {
        propertyIsEager[key] = true;
        code = value;
      }

      let get = async () => {
        tree ??= new ObjectTree(object);
        // If key has extension, getter attaches unpack method
        let result = await evaluate.call(tree, code);
        if (extname) {
          result = await handleExtension(tree, result, key);
        }
        return result;
      };
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable,
        get,
      });
    }
  }

  // Attach a keys method
  Object.defineProperty(object, symbols.keys, {
    configurable: true,
    enumerable: false,
    value: () => keys(object, propertyIsEager, propertyIsEnumerable, entries),
    writable: true,
  });

  // Attach the parent
  Object.defineProperty(object, symbols.parent, {
    configurable: true,
    enumerable: false,
    value: parent,
    writable: true,
  });

  // Evaluate any properties that were declared as immediate: get their value
  // and overwrite the property getter with the actual value.
  const propertyTraces = [];
  const promises = entries.map(async (entry, index) => {
    const key = entry[0];
    if (propertyIsEager[key]) {
      const { result, trace } = await traceJavaScriptFunction(
        () => object[key]
      );
      propertyTraces[index] = trace;
      // @ts-ignore Unclear why TS thinks `object` might be undefined here
      const enumerable = Object.getOwnPropertyDescriptor(
        object,
        key
      ).enumerable;
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable,
        value: result,
        writable: true,
      });
    }
  });
  await Promise.all(promises);

  return object;
}

function entryKey(object, eager, entry) {
  const [key, value] = entry;

  const hasExplicitSlash = trailingSlash.has(key);
  if (hasExplicitSlash) {
    // Return key as is
    return key;
  }

  // If eager property value is treelike, add slash to the key
  if (eager && Tree.isTreelike(object[key])) {
    return trailingSlash.add(key);
  }

  // If entry will definitely create a subtree, add a trailing slash
  const entryCreatesSubtree =
    value instanceof Array &&
    (value[0] === ops.object ||
      (value[0] === ops.getter &&
        value[1] instanceof Array &&
        (value[1][0] === ops.object || value[1][0] === ops.merge)));
  return trailingSlash.toggle(key, entryCreatesSubtree);
}

function keys(object, propertyIsEager, propertyIsEnumerable, entries) {
  return entries
    .filter(([key]) => propertyIsEnumerable[key])
    .map((entry) => entryKey(object, propertyIsEager[entry[0]], entry));
}
