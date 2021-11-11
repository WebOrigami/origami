import YAML from "yaml";

export function applyMixinToGraph(Mixin, graph) {
  //   // Create a class that proxies properties/methods to the object.
  //   const Base = makeProxyClass(graph);
  //   // Apply the mixin, and add some handling for the graph's `get` method.
  //   class Mixed extends Mixin(Base) {
  //     async get(...keys) {
  //       let value = await super.get(...keys);
  //       if (
  //         ExplorableGraph.isExplorable(value) &&
  //         !(value instanceof this.constructor)
  //       ) {
  //         // Wrap subgraphs in a new instance of the mixed class.
  //         value = Reflect.construct(this.constructor, [value]);
  //       }
  //       return value;
  //     }
  //   }
  //   // Instantiate the mixed class and return a new instance.
  //   // @ts-ignore
  //   const mixed = new Mixed(graph);
  //   return mixed;
  return applyMixinToObject(Mixin, graph);
}

/**
 * Apply a functional class mixin to an individual object instance.
 *
 *
 *
 * @param {Function} Mixin
 * @param {any} obj
 */
export function applyMixinToObject(Mixin, obj) {
  const mixed = new (Mixin(Object))();
  // The mixin may have added multiple prototypes to the chain.
  // Walk up the prototype chain until we hit Object.
  let proto = mixed.__proto__;
  while (proto.__proto__ !== Object.prototype) {
    proto = proto.__proto__;
  }
  Object.setPrototypeOf(proto, obj);
  return mixed;
}

export function constructSubgraph(constructor, dictionary) {
  const args = Object.values(dictionary);
  const result = Reflect.construct(constructor, args);
  for (const [key, value] of Object.entries(dictionary)) {
    if (result[key] !== value) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Extract front matter from the given text. The first line of the text must be
 * "---", followed by a block of JSON or YAML, followed by another line of
 * "---". Any lines following will be returned added to the data under a
 * `content` key.
 *
 * If the text does not contain front matter, this returns null.
 *
 * @param {string} text
 */
export function extractFrontMatter(text) {
  const regex = /^---\r?\n(?<front>[\s\S]*)\r?\n---\r?\n(?<content>[\s\S]*$)/;
  const match = regex.exec(text);
  if (match) {
    const { front, content } = /** @type {any} */ (match).groups;
    const data = YAML.parse(front);
    data.content = content;
    return data;
  }
  return null;
}

/**
 * Return true if the object is a plain JavaScript object.
 *
 * @param {any} obj
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

export function toSerializable(obj) {
  if (isPlainObject(obj)) {
    const result = {};
    for (const key in obj) {
      result[key] = toSerializable(obj[key]);
    }
    return result;
  } else if (obj instanceof Array) {
    return obj.map((value) => toSerializable(value));
  } else {
    // Leave primitive and built-in types alone
    const t = typeof obj;
    if (
      t === "boolean" ||
      t === "number" ||
      t === "bigint" ||
      t === "string" ||
      obj instanceof Date ||
      obj === null
    ) {
      return obj;
    } else {
      // Unknown type; try to cast to string.
      return obj?.toString?.();
    }
  }
}
