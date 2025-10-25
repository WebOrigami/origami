import {
  extension,
  ObjectMap,
  setParent,
  symbols,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import handleExtension from "./handleExtension.js";
import { evaluate, ops } from "./internal.js";

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
 * @param {import("../../index.ts").RuntimeState} [state]
 */
export default async function expressionObject(entries, state = {}) {
  // Create the object and set its parent
  const object = {};
  const parent = state?.object ?? null;
  if (parent !== null && !Tree.isAsyncTree(parent)) {
    throw new TypeError(`Parent must be an AsyncTree or null`);
  }
  setParent(object, parent);

  let tree;
  const eagerProperties = [];
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
        eagerProperties.push(key);
        code = value;
      }

      const get = async () => {
        tree ??= new ObjectMap(object);
        const newState = Object.assign({}, state, { object: tree });
        const result = await evaluate(code, newState);
        return extname ? handleExtension(result, key, tree) : result;
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
    value: () => keys(object, eagerProperties, propertyIsEnumerable, entries),
    writable: true,
  });

  // Evaluate any properties that were declared as immediate: get their value
  // and overwrite the property getter with the actual value.
  for (const key of eagerProperties) {
    const value = await object[key];
    // @ts-ignore Unclear why TS thinks `object` might be undefined here
    const enumerable = Object.getOwnPropertyDescriptor(object, key).enumerable;
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable,
      value,
      writable: true,
    });
  }

  return object;
}

export function entryKey(entry, object = null, eagerProperties = []) {
  let [key, value] = entry;

  if (key[0] === "(" && key[key.length - 1] === ")") {
    // Non-enumerable property, remove parentheses. This doesn't come up in the
    // constructor, but can happen in situations encountered by the compiler's
    // optimizer.
    key = key.slice(1, -1);
  }

  if (trailingSlash.has(key)) {
    // Explicit trailing slash, return as is
    return key;
  }

  // If eager property value is treelike, add slash to the key
  if (eagerProperties.includes(key) && Tree.isTreelike(object?.[key])) {
    return trailingSlash.add(key);
  }

  if (!(value instanceof Array)) {
    // Can't be a subtree
    return trailingSlash.remove(key);
  }

  // If we're dealing with a getter, work with what that gets
  if (value[0] === ops.getter) {
    value = value[1];
  }

  // If entry will definitely create a subtree, add a trailing slash
  if (value[0] === ops.object) {
    // Subtree
    return trailingSlash.add(key);
  }

  // See if it looks a merged object
  if (value[1] === "_result" && value[0][0] === ops.object) {
    // Merge
    return trailingSlash.add(key);
  }

  return key;
}

function keys(object, eagerProperties, propertyIsEnumerable, entries) {
  return entries
    .filter(([key]) => propertyIsEnumerable[key])
    .map((entry) => entryKey(entry, object, eagerProperties));
}
