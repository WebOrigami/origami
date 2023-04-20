/**
 * Retrieve the indicated web resource via HTTPS.
 *
 * @this {Explorable}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function https(host, ...keys) {
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

https.usage = `@https <host>, <...keys>\tA web resource via HTTPS`;
https.documentation = "https://graphorigami.org/language/@https.html";
