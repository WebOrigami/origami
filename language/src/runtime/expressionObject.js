import { ObjectTree, symbols } from "@weborigami/async-tree";
import { attachHandlerIfApplicable, extname } from "./extensions.js";
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
  Object.defineProperty(object, symbols.parent, {
    value: parent,
    writable: true,
    configurable: true,
    enumerable: false,
  });

  let tree;
  const immediateProperties = [];
  for (const [key, value] of entries) {
    const extension = extname(key);
    if (!extension && !(value instanceof Array)) {
      // Simple property
      object[key] = value;
    } else {
      // Property defined by code, add as a getter
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
          return attachHandlerIfApplicable(tree, result, key);
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
        enumerable: true,
        get,
      });
    }
  }

  // Evaluate any properties that were declared as immediate: get their value
  // and overwrite the property getter with the actual value.
  for (const key of immediateProperties) {
    const value = await object[key];
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  }

  return object;
}
