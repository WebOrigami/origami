import { ObjectTree, symbols, Tree } from "@weborigami/async-tree";
import { extname, handleExtension } from "./extensions.js";
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
 * 1. An immediate code entry. This will be evaluated during this call and its
 *    result defined as an object property.
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
  Object.defineProperty(object, symbols.parent, {
    configurable: true,
    enumerable: false,
    value: parent,
    writable: true,
  });

  let tree;
  const immediateProperties = [];
  for (let [key, value] of entries) {
    // Determine if we need to define a getter or a regular property. If the key
    // has an extension, we need to define a getter. If the value is code (an
    // array), we need to define a getter -- but if that code takes the form
    // [ops.getter, <primitive>], we can define a regular property.
    let defineProperty;
    const extension = extname(key);
    if (extension) {
      defineProperty = false;
    } else if (!(value instanceof Array)) {
      defineProperty = true;
    } else if (value[0] === ops.getter && !(value[1] instanceof Array)) {
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

    if (defineProperty) {
      // Define simple property
      // object[key] = value;
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
        immediateProperties.push(key);
        code = value;
      }

      let get;
      if (extension) {
        // Key has extension, getter will invoke code then attach unpack method
        get = async () => {
          tree ??= new ObjectTree(object);
          const result = await evaluate.call(tree, code);
          return handleExtension(tree, result, key);
        };
      } else {
        // No extension, so getter just invokes code.
        get = async () => {
          tree ??= new ObjectTree(object);
          return evaluate.call(tree, code);
        };
      }

      Object.defineProperty(object, key, {
        configurable: true,
        enumerable,
        get,
      });
    }
  }

  // Evaluate any properties that were declared as immediate: get their value
  // and overwrite the property getter with the actual value.
  for (const key of immediateProperties) {
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
