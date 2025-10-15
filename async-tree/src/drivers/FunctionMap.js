import setParent from "../utilities/setParent.js";
import MapBase from "./MapBase.js";

export default class FunctionMap extends MapBase {
  constructor(fn, domain = []) {
    if (typeof fn !== "function") {
      throw new TypeError("FunctionMap: first argument must be a function");
    }
    super();
    this.fn = fn;
    this.domain = domain;
  }

  /**
   * Return the application of the function to the given key.
   *
   * @param {any} key
   */
  get(key) {
    let value =
      this.fn.length <= 1
        ? // Function takes no arguments, one argument, or a variable number of
          // arguments: invoke it.
          this.fn(key)
        : // Bind the key to the first parameter. Subsequent get calls will
          // eventually bind all parameters until only one remains. At that point,
          // the above condition will apply and the function will be invoked.
          Reflect.construct(this.constructor, [this.fn.bind(null, key)]);
    if (value instanceof Promise) {
      value = value.then((v) => {
        setParent(v, this);
        return v;
      });
    } else {
      setParent(value, this);
    }
    return value;
  }

  keys() {
    return this.domain[Symbol.iterator]();
  }
}
