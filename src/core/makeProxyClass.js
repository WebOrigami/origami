/**
 * A class factory: given an object, returns a class that can will proxy
 * property and method callss to that object.
 */
export default function makeProxyClass(obj) {
  // We define an intermediate Base class that will proxy property and
  // method requests to the base object. This class will take a single argument:
  // whereas the Mixin takes a class argument, the intermediate class will
  // take an object argument -- the object to extend.
  //
  // This intermediate class' prototype is a Proxy that will handle the
  // property/method forwarding. This shenanigna requires that we define the
  // class using function/prototype syntax instead of class syntax.
  function ObjectProxy(base) {
    this.base = base;
  }
  ObjectProxy.prototype = new Proxy(
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
  ObjectProxy.prototype.constructor = ObjectProxy;

  return ObjectProxy;
}
