/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import { isGraphable } from "@graphorigami/core/src/Graph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

// If the given plain object has only integer keys, return it as an array.
// Otherwise return it as is.
export function castArrayLike(obj) {
  let hasKeys = false;
  let expectedIndex = 0;
  for (const key in obj) {
    hasKeys = true;
    const index = Number(key);
    if (isNaN(index) || index !== expectedIndex) {
      // Not an array-like object.
      return obj;
    }
    expectedIndex++;
  }
  return hasKeys ? Object.values(obj) : obj;
}

/**
 * If the given path ends in an extension, return it. Otherwise, return the
 * empty string.
 *
 * This is meant as a basic replacement for the standard Node `path.extname`.
 * That standard function inaccurately returns an extension for a path that
 * includes a near-final extension but ends in a final slash, like "foo.txt/".
 * Node thinks that path has a ".txt" extension, but for our purposes it
 * doesn't.
 *
 * @param {string} path
 */
export function extname(path) {
  // We want at least one character before the dot, then a dot, then a non-empty
  // sequence of characters after the dot that aren't slahes or dots.
  const extnameRegex = /[^/](?<ext>\.[^/\.]+)$/;
  const match = path.match(extnameRegex);
  const extension = match?.groups?.ext.toLowerCase() ?? "";
  return extension;
}

/**
 * Return the Object prototype at the root of the object's prototype chain.
 *
 * This is used by functions like isPlainObject() to handle cases where the
 * `Object` at the root prototype chain is in a different realm.
 *
 * @param {any} obj
 */
export function getRealmObjectPrototype(obj) {
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return proto;
}

/**
 * If the given graph has a `scope` property, return that. Otherwise, return the
 * graph itself.
 *
 * @param {AsyncDictionary|null} graph
 * @returns {AsyncDictionary}
 */
export function getScope(graph) {
  return /** @type {any} */ (graph)?.scope ?? graph;
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

  // We treat object-like things with no prototype (like a Module) as plain
  // objects.
  if (Object.getPrototypeOf(obj) === null) {
    return true;
  }

  // Do we inherit directly from Object in this realm?
  return Object.getPrototypeOf(obj) === getRealmObjectPrototype(obj);
}

export function isTransformApplied(Transform, obj) {
  let transformName = Transform.name;
  if (!transformName) {
    throw `isTransformApplied was called on an unnamed transform function, but a name is required.`;
  }
  if (transformName.endsWith("Transform")) {
    transformName = transformName.slice(0, -9);
  }
  // Walk up prototype chain looking for a constructor with the same name as the
  // transform. This is not a great test.
  for (let proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
    if (proto.constructor.name === transformName) {
      return true;
    }
  }
  return false;
}

export const keySymbol = Symbol("key");

/**
 * Return a new graph equivalent to the given graph, but with the given context.
 *
 * If the graph already has a `parent` property, this uses the graph as a
 * prototype for the result -- the original graph is not modified. If the graph
 * doesn't have a `parent` property, this applies InheritScopeTransform.
 *
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @param {Graphable} variant
 * @param {AsyncDictionary|null} context
 * @returns {AsyncDictionary & { parent: AsyncDictionary }}
 */
export function graphInContext(variant, context) {
  // Either method of constructing the target produces a new graph.
  const graph = Graph.from(variant);
  const target =
    "parent" in graph
      ? Object.create(graph)
      : transformObject(InheritScopeTransform, graph);
  target.parent = context;
  return target;
}

export function stringLike(value) {
  return (
    typeof value === "string" ||
    value instanceof String ||
    (globalThis.Buffer && value instanceof Buffer)
  );
}

/**
 * Convert the given object to a function.
 *
 * @typedef {import("../..").Invocable} Invocable
 * @param {Invocable|any} obj
 */
export function toFunction(obj) {
  if (typeof obj === "function") {
    // Return a function as is.
    return obj;
  } else if (
    typeof obj === "object" &&
    typeof (/** @type {any} */ (obj)?.contents) === "function"
  ) {
    // Extract the contents of the object and convert that to a function.
    let fn;
    /** @this {any} */
    return async function (...args) {
      if (!fn) {
        const contents = await /** @type {any} */ (obj).contents();
        fn = toFunction(contents);
      }
      return fn.call(this, ...args);
    };
  } else if (isGraphable(obj)) {
    // Return a function that invokes the graph's getter.
    return Graph.toFunction(obj);
  } else {
    // Return a constant function.
    return () => obj;
  }
}

/**
 * Apply a functional class mixin to an individual object instance.
 *
 * This works by create an intermediate class, creating an instance of that, and
 * then setting the intermediate class's prototype to the given individual
 * object. The resulting, extended object is then returned.
 *
 * This manipulation of the prototype chain is generally sound in JavaScript,
 * with some caveats. In particular, the original object class cannot make
 * direct use of private members; JavaScript will complain if the extended
 * object does anything that requires access to those private members.
 *
 * @param {Function} Transform
 * @param {any} obj
 */
export function transformObject(Transform, obj) {
  // Apply the mixin to Object and instantiate that. The Object base class here
  // is going to be cut out of the prototype chain in a moment; we just use
  // Object as a convenience because its constructor takes no arguments.
  const mixed = new (Transform(Object))();

  // Find the highest prototype in the chain that was added by the class mixin.
  // The mixin may have added multiple prototypes to the chain. Walk up the
  // prototype chain until we hit Object.
  let mixinProto = Object.getPrototypeOf(mixed);
  while (Object.getPrototypeOf(mixinProto) !== Object.prototype) {
    mixinProto = Object.getPrototypeOf(mixinProto);
  }

  // Redirect the prototype chain above the mixin to point to the original
  // object. The mixed object now extends the original object with the mixin.
  Object.setPrototypeOf(mixinProto, obj);

  // Create a new constructor for this mixed object that reflects its prototype
  // chain. Because we've already got the instance we want, we won't use this
  // constructor now, but this can be used later to instantiate other objects
  // that look like the mixed one.
  mixed.constructor = Transform(obj.constructor);

  // Return the mixed object.
  return mixed;
}
