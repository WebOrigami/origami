import { Tree } from "@graphorigami/async-tree";

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
 * Convert the given object to a function.
 *
 * @typedef {import("../../index.ts").Invocable} Invocable
 * @param {any} obj
 * @returns {Function}
 */
export function toFunction(obj) {
  if (typeof obj === "function") {
    // Return a function as is.
    return obj;
  } else if (
    typeof obj === "object" &&
    typeof (/** @type {any} */ (obj)?.unpack) === "function"
  ) {
    // Extract the contents of the object and convert that to a function.
    let fn;
    /** @this {any} */
    return async function (...args) {
      if (!fn) {
        const content = await /** @type {any} */ (obj).unpack();
        fn = toFunction(content);
      }
      return fn.call(this, ...args);
    };
  } else if (Tree.isTreelike(obj)) {
    // Return a function that invokes the tree's getter.
    return Tree.toFunction(obj);
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
