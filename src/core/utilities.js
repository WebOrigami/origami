import YAML from "yaml";
import ExplorableGraph from "./ExplorableGraph.js";

/**
 * Apply a functional class mixin to an individual object instance.
 *
 * Graph transformations can be defined with mixins that extend a graph base
 * class. Sometimes it's useful to apply such a mixin to an individual object
 * instance. That is what this function does.
 *
 * This works by creating an intermediate class whose prototype is a Proxy to
 * the base object. That Proxy will take care of forwarding any property or
 * methods that are not defined in the mixin to the base object.
 *
 * @param {Function} Mixin
 * @param {any} obj
 */
export function applyMixinToObject(Mixin, obj) {
  // We define an intermediate Base class that will proxy property and
  // method requests to the base object. This class will take a single argument:
  // whereas the Mixin takes a class argument, the intermediate class will
  // take an object argument -- the object to extend.
  //
  // This intermediate class' prototype is a Proxy that will handle the
  // property/method forwarding. This shenanigna requires that we define the
  // class using function/prototype syntax instead of class syntax.
  function Base(base) {
    this.base = base;
  }
  Base.prototype = new Proxy(
    // Proxy target: tracks the base object the Base class instance extends.
    {
      obj,
    },
    // Proxy handler: handles property/method forwarding.
    {
      // If the mixin doesn't define a property/method, this `get` method will
      // be invoked.
      get(target, prop, receiver) {
        if (prop === "base") {
          return receiver.base;
        }

        // Forward other property requests to the base object.
        const value = receiver.base?.[prop];

        // If the property value is a function defined by the base object, we
        // need to bind the function to the base object. This ensures that the
        // function will be able to access private members of the base object.
        return value instanceof Function ? value.bind(receiver.base) : value;
      },

      // Similarly, forward requests that want to know if this object has a
      // particular property to the *original* object.
      has(target, prop) {
        return prop === "base" ? true : Reflect.has(obj, prop);
      },

      // If someone tries to set a property that's not defined by the mixin, and
      // the base object has that property, forward the set request.
      set(target, prop, value, receiver) {
        if (
          prop === "base" ||
          prop === "constructor" ||
          !(prop in receiver.base)
        ) {
          Reflect.set(target, prop, value, receiver);
        } else {
          // Set the property on the base object.
          receiver.base[prop] = value;
        }
        return true;
      },
    }
  );
  Base.prototype.constructor = Base;

  // Now that we've defined the intermediate Base class, apply the mixin to it
  // to produce a new, mixed class.
  class Mixed extends Mixin(Base) {
    // Define this so TypeScript knows the constructor expects an argument.
    constructor(base) {
      super(base);
    }

    // HACK — this is specific to graphs.
    async get(...keys) {
      let value = await super.get(...keys);
      if (
        ExplorableGraph.isExplorable(value) &&
        !(value instanceof this.constructor)
      ) {
        value = Reflect.construct(this.constructor, [value]);
      }
      return value;
    }
  }

  // Instantiate the mixed class and return that instance. It will include all
  // the properties and methods of both the mixin and the base object.
  const mixed = new Mixed(obj);
  return mixed;
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
