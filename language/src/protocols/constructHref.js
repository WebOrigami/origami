import { pathFromKeys } from "@weborigami/async-tree";

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @param {string} protocol
 * @param {string} host
 * @param  {string[]} keys
 */
export default function constructHref(protocol, host, ...keys) {
  const path = pathFromKeys(keys);
  let href = [host, path].join("/");
  if (!href.startsWith(protocol)) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    href = `${protocol}${href}`;
  }
  return href;
}
