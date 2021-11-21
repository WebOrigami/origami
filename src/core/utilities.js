import * as YAMLModule from "yaml";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Apply a functional class mixin to an individual object instance.
 *
 * This works by create an intermediate class, creating an instance of that, and
 * then setting the intermedia class's prototype to the given individual object.
 * The resulting, extended object is then returned.
 *
 * This manipulation of the prototype chain is generally sound in JavaScript,
 * with some caveats. First, the original object class cannot make direct use of
 * private members; JavaScript will generally complain if the extended object
 * does anything that requires access to those private members.
 *
 * @param {Function} Mixin
 * @param {any} obj
 */
export function applyMixinToObject(Mixin, obj) {
  // Create an intermediate class that applies the mixin to Object, then
  // instantiate that.
  const mixed = new (Mixin(Object))();

  // Find the highest prototype in the chain that was added by the Mixin. The
  // mixin may have added multiple prototypes to the chain. Walk up the
  // prototype chain until we hit Object.
  let mixinProto = mixed.__proto__;
  while (mixinProto.__proto__ !== Object.prototype) {
    mixinProto = mixinProto.__proto__;
  }

  // Redirect the prototype chain above the mixin to point to the original
  // object.
  Object.setPrototypeOf(mixinProto, obj);

  // Return the extended object.
  return mixed;
}

/**
 * ExplorableGraph substrates like ExplorableObject and ExplorableFiles
 * need to be able to return instances of those classes for explorable
 * subgraphs.
 *
 * Because those substrate classes are often extended by mixins, they
 * cannot simply call `new ExplorableObject`; the actual constructor
 * may have been extended.
 *
 * Moreover, they need to account for the possibility that the graph instance
 * that is returning the subgraph is the result of applying a class mixin to an
 * individual object instance using applyMixinToObject. Because of how that
 * routine works, the arguments passed to the constructor may not get applied.
 * This function therefore checks to see whether the constructor arguments were
 * applied and, if not, applies them.
 */
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
    const frontMatter = YAML.parse(front);
    return { frontMatter, content };
  } else {
    return {
      frontMatter: null,
      content: text,
    };
  }
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
