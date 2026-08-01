import { AsyncMap, isPlainObject, SyncMap, Tree } from "@weborigami/async-tree";
import { cachePathSymbol } from "../runtime/symbols.js";
import AsyncCacheTransform from "./AsyncCacheTransform.js";
import SyncCacheTransform from "./SyncCacheTransform.js";
import systemCache from "./systemCache.js";
import SystemCacheMap from "./SystemCacheMap.js";

// For detecting async functions
const AsyncFunction = async function () {}.constructor;

// Placeholder used in cache path if no argument is supplied to a function
const NO_ARGUMENT = "_noarg\uFFFF";

/**
 * Given a maplike object whose values can be cached, enable caching. This may
 * apply a caching transform, and sets a cache path on the object so that it can
 * use as the prefix for cache paths.
 *
 * Note: this typically destructively modifies the given value.
 *
 * @param {any} value
 * @param {string} cachePath
 */
export default function enableValueCaching(value, cachePath) {
  // Value must be a defined object or function, and not have already have a
  // cache path, and be maplike.
  const cachable =
    value &&
    (typeof value === "object" || typeof value === "function") &&
    value[cachePathSymbol] === undefined &&
    Tree.isMaplike(value);

  if (cachable) {
    if (isPlainObject(value)) {
      // Expression objects do their own caching
      // TODO: What if it's some other kind of plain object?
      markCacheable(value, cachePath);
    } else if (Array.isArray(value)) {
      // Cache arrays
      markCacheable(value, cachePath);
    } else if (value instanceof Function) {
      // Cache a function
      value = cacheFunction(value, cachePath);
    } else if (
      isTransformApplied(SyncCacheTransform, value) ||
      isTransformApplied(AsyncCacheTransform, value)
    ) {
      // Already has caching transform applied; just mark cacheable
      markCacheable(value, cachePath);
    } else {
      // Other maplike; convert to a Map/AsyncMap
      value = Tree.from(value);
      if (value instanceof Map) {
        if (!(value instanceof SyncMap)) {
          // Convert regular Map to SyncMap so we can extend it
          value = new (SyncCacheTransform(SyncMap))(value);
        } else {
          // Cache a SyncMap
          value = transformObject(SyncCacheTransform, value);
        }
      } else if (value instanceof AsyncMap) {
        // Cache an AsyncMap
        value = transformObject(AsyncCacheTransform, value);
      }
      markCacheable(value, cachePath);
    }
  }

  return value;
}

/**
 * Cache a function that takes no arguments or string arguments
 *
 * @param {Function} fn
 * @param {string} cachePath
 */
export function cacheFunction(fn, cachePath) {
  let result;
  if (fn instanceof AsyncFunction) {
    // Return an async function that caches results for a unary argument
    result = async (...args) => {
      const keyCachePath = getKeyCachePath(cachePath, args);
      if (keyCachePath === null) {
        // Run function in context of this cache path, but don't cache result
        return systemCache.runInContextAsync(cachePath, () => fn(...args));
      }
      let result = systemCache.getOrInsertComputedAsync(
        keyCachePath,
        async () => fn(...args),
      );
      result = enableValueCaching(result, keyCachePath);
      return result;
    };
  } else {
    // Return a sync function that caches results for a unary argument
    result = (...args) => {
      const keyCachePath = getKeyCachePath(cachePath, args);
      if (keyCachePath === null) {
        // Run function in context of this cache path, but don't cache result
        return systemCache.runInContext(cachePath, () => fn(...args));
      }
      let result = systemCache.getOrInsertComputed(keyCachePath, () =>
        fn(...args),
      );
      result = enableValueCaching(result, keyCachePath);
      return result;
    };
  }

  // Copy over any properties that were attached to the function
  Object.assign(result, fn);
  // Ensure length matches
  Object.defineProperty(result, "length", {
    value: fn.length,
    configurable: true,
  });

  markCacheable(result, cachePath);
  return result;
}

function getKeyCachePath(cachePath, args) {
  const allStringArguments = args.every((arg) => typeof arg === "string");
  if (!allStringArguments) {
    return null;
  } else if (args.length === 0) {
    // Use a placeholder for no arguments
    return SystemCacheMap.joinPath(cachePath, NO_ARGUMENT);
  } else {
    // Replace any slashes in arguments with encoded slashes
    const escaped = args.map((arg) => arg.replace(/\//g, "%2F"));
    return SystemCacheMap.joinPath(cachePath, ...escaped);
  }
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

function markCacheable(object, cachePath) {
  Object.defineProperty(object, cachePathSymbol, {
    configurable: true,
    enumerable: false,
    value: cachePath,
  });
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
