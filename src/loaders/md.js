import meta from "../builtins/meta.js";
import { extractFrontMatter } from "../core/utilities.js";

/**
 * Load a file as markdown.
 *
 * If the markdown appears to include front matter, the function will attempt to
 * parse the front matter. If successful, the document will be returned as a
 * String with an attached graph with the front matter and document content as
 * data.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadMd(buffer, key) {
  const text = String(buffer);

  const frontMatter = extractFrontMatter(text);
  if (!frontMatter) {
    // Didn't find, or couldn't parse, front matter
    return text;
  }

  const textWithGraph = new String(text);
  const scope = this;
  let graph;

  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!graph) {
      const { frontData, bodyText } = frontMatter;
      const data = Object.assign(frontData, {
        "@text": bodyText,
      });
      graph = meta.call(scope, data);
    }
    return graph;
  };

  return textWithGraph;
}
