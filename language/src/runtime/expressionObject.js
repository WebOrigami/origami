import {
  extension,
  ObjectMap,
  setParent,
  symbols,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import execute from "./execute.js";
import handleExtension from "./handleExtension.js";
import { ops } from "./internal.js";

export const KEY_TYPE = {
  STRING: 0, // Simple string key: `a: 1`
  COMPUTED: 1, // Computed key: `[code]: 1`
};

const VALUE_TYPE = {
  PRIMITIVE: 0, // Primitive value: `a: 1`
  EAGER: 1, // Calculated immediately: `a: 1 + 1`
  GETTER: 2, // Calculated on demand: `a = fn()`
};

/**
 * Given an array of entries with string keys and Origami code values (arrays of
 * ops and operands), return an object with the same keys defining properties
 * whose getters evaluate the code.

 * @param {*} entries
 * @param {import("../../index.ts").RuntimeState} [state]
 */
export default async function expressionObject(entries, state = {}) {
  // Create the object and set its parent
  const object = {};
  const parent = state?.object ?? null;
  if (parent !== null && !Tree.isMap(parent)) {
    throw new TypeError(`Parent must be a map or null`);
  }
  setParent(object, parent);

  // The object in Map form for use on the stack
  const map = new ObjectMap(object);

  // Preparation: gather information about all properties
  const infos = entries.map(([key, value]) => propertyInfo(key, value));

  // First pass: define all properties with plain string keys
  for (const info of infos) {
    if (info.keyType === KEY_TYPE.STRING) {
      defineProperty(object, info, state, map);
    }
  }

  // Second pass: redefine eager string-keyed properties with actual values.
  for (const info of infos) {
    if (
      info.keyType === KEY_TYPE.STRING &&
      info.valueType === VALUE_TYPE.EAGER
    ) {
      await redefineProperty(object, info);
    }
  }

  // Third pass: define all computed properties. These may refer to the
  // properties we just defined.
  for (const info of infos) {
    if (info.keyType === KEY_TYPE.COMPUTED) {
      const newState = Object.assign({}, state, { object: map });
      const key = await execute(/** @type {any} */ (info.key), newState);
      // Destructively update the property info with the computed key
      info.key = key;
      defineProperty(object, info, state, map);
    }
  }

  // Fourth pass: redefine eager computed-keyed properties with actual values.
  for (const info of infos) {
    if (
      info.keyType === KEY_TYPE.COMPUTED &&
      info.valueType === VALUE_TYPE.EAGER
    ) {
      await redefineProperty(object, info);
    }
  }

  // Attach a keys method, where keys for primitive/eager properties with
  // maplike values get a trailing slash.
  Object.defineProperty(object, symbols.keys, {
    configurable: true,
    enumerable: false,
    value: () =>
      infos
        .filter((info) => info.enumerable)
        .map((info) => normalizeKey(info, object)),
    writable: true,
  });

  // TODO: If there are any getters, mark the object as async. Note: this code
  // was added so that Tree.from() could know whether to return an ObjectMap or
  // a hypothetical AsyncObjectMap, which in turn would let a map operation know
  // whether to expect async property values. const hasGetters =
  // infos.some((info) => info.valueType === VALUE_TYPE.GETTER); if (hasGetters)
  // { Object.defineProperty(object, symbols.async, { configurable: true,
  // enumerable: false, value: true, writable: true,
  //   });
  // }

  return object;
}

/**
 * Define a single property on the object
 */
function defineProperty(object, propertyInfo, state, map) {
  let { enumerable, hasExtension, key, value, valueType } = propertyInfo;
  if (valueType == VALUE_TYPE.PRIMITIVE) {
    // Define simple property
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable,
      value,
      writable: true,
    });
  } else {
    // Eager or getter; will evaluate eager property later
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable,
      get: async () => {
        const newState = Object.assign({}, state, { object: map });
        const result = await execute(value, newState);
        return hasExtension ? handleExtension(result, key, map) : result;
      },
    });
  }
}

/**
 * Return a normalized version of the property key for use in the keys() method.
 * Among other things, this adds trailing slashes to keys that correspond to
 * maplike values.
 *
 * @param {any} propertyInfo
 * @param {object|null} [object]
 */
export function normalizeKey(propertyInfo, object = null) {
  const { key, value, valueType } = propertyInfo;

  if (trailingSlash.has(key)) {
    // Explicit trailing slash, return as is
    return key;
  }

  // If actual property value is maplike, add slash
  if (
    (valueType === VALUE_TYPE.EAGER || valueType === VALUE_TYPE.PRIMITIVE) &&
    Tree.isMaplike(object?.[key])
  ) {
    return trailingSlash.add(key);
  }

  // Look at value code to see if it will produce a maplike value
  if (!(value instanceof Array)) {
    // Can't be a subtree
    return trailingSlash.remove(key);
  }
  if (value[0] === ops.object) {
    // Creates an object; maplike
    return trailingSlash.add(key);
  }
  if (value[1] === "_result" && value[0][0] === ops.object) {
    // Merges an object; maplike
    return trailingSlash.add(key);
  }

  // Return as is
  return key;
}

/**
 * Given a key and the code for its value, determine some basic aspects of the
 * property. This may return an updated key and/or value as well.
 */
export function propertyInfo(key, value) {
  // If the key is wrapped in parentheses, it is not enumerable.
  let enumerable = true;
  if (
    typeof key === "string" &&
    key[0] === "(" &&
    key[key.length - 1] === ")"
  ) {
    key = key.slice(1, -1);
    enumerable = false;
  }

  const keyType = key instanceof Array ? KEY_TYPE.COMPUTED : KEY_TYPE.STRING;

  let valueType;
  if (!(value instanceof Array)) {
    // Primitive, no code to evaluate
    valueType = VALUE_TYPE.PRIMITIVE;
  } else if (value[0] !== ops.getter) {
    // Code will be eagerly evaluated when object is constructed
    valueType = VALUE_TYPE.EAGER;
  } else {
    // Defined as a getter
    value = value[1]; // The actual code
    if (!(value instanceof Array)) {
      // Getter returns a primitive value; treat as regular property
      valueType = VALUE_TYPE.PRIMITIVE;
    } else if (value[0] === ops.literal) {
      // Getter returns a literal value; treat as eager property
      valueType = VALUE_TYPE.EAGER;
    } else {
      valueType = VALUE_TYPE.GETTER;
    }
  }

  const hasExtension =
    typeof key === "string" && extension.extname(key).length > 0;

  // Special case: if the key has an extension but the value is a primitive,
  // treat it as eager so we can handle the extension.
  if (hasExtension && valueType === VALUE_TYPE.PRIMITIVE) {
    valueType = VALUE_TYPE.EAGER;
  }

  return { enumerable, hasExtension, key, keyType, value, valueType };
}

/**
 * Get the value of the indicated eager property and overwrite the property
 * definition with the actual value.
 */
async function redefineProperty(object, info) {
  const value = await object[info.key];
  Object.defineProperty(object, info.key, {
    configurable: true,
    enumerable: info.enumerable,
    value,
    writable: true,
  });
}
