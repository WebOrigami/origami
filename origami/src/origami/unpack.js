/**
 * Unpack a packed format like a Uint8Array or ArrayBuffer to a usable form like
 * text or a plain JavaScript object.
 *
 * @param {any} obj
 */
export default function unpack(obj) {
  if (obj == null) {
    throw new ReferenceError("Cannot unpack null or undefined value");
  }
  return obj.unpack?.() ?? obj;
}
