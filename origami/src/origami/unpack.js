/**
 * Unpack a packed format like a Uint8Array or ArrayBuffer to a usable form like
 * text or a plain JavaScript object.
 *
 * @param {any} obj
 */
export default function unpack(obj) {
  return obj?.unpack?.() ?? obj;
}
