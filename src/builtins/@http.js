import fetch from "node-fetch";

/**
 * Retrieve the indicated web resource via HTTP.
 *
 * @this {Explorable}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function http(host, ...keys) {
  let href = [host, ...keys].join("/");
  if (!href.startsWith("https") || !href.startsWith("http")) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    if (!href.startsWith("http")) {
      href = `http:${href}`;
    }
  }
  const response = await fetch(href);
  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }
  return undefined;
}

http.usage = `@http <host>, <...keys>\tA web resource via HTTP`;
http.documentation = "http://graphorigami.org/cli/builtins.html#@http";
