import { pathFromKeys } from "@weborigami/async-tree";

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @param {string} protocol
 * @param {string} host
 * @param  {string[]} keys
 */
export default function constructHref(protocol, host, ...keys) {
  let href = host.endsWith("/") ? host.slice(0, -1) : host;
  const path = pathFromKeys(keys);
  if (path) {
    href += "/" + path;
  }
  if (!href.startsWith(protocol)) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    href = `${protocol}${href}`;
  }
  return href;
}
