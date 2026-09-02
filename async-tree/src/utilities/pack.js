import toString from "./toString.js";

/**
 * Converts a value to a Uint8Array, e.g., for transmission.
 *
 * @param {any} value
 * @param {string} [descriptor]
 * @returns {Uint8Array}
 */
export default function pack(value, descriptor) {
  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  } else if (value instanceof String) {
    return new TextEncoder().encode(value.toString());
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else {
    const string = toString(value);
    if (string !== null) {
      return new TextEncoder().encode(string);
    } else {
      const message = descriptor
        ? `Couldn't convert to buffer: ${descriptor}`
        : "Couldn't convert to buffer";
      throw new TypeError(message);
    }
  }
}
