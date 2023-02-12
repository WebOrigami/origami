import ObjectGraph from "../core/ObjectGraph.js";
import { extractFrontMatter } from "../core/utilities.js";
import MetaTransform from "../framework/MetaTransform.js";
import DeferredGraph from "./DeferredGraph.js";
import StringWithGraph from "./StringWithGraph.js";

/**
 * Load a file as text with possible front matter.
 *
 * If the text starts with `---`, the loader attempts to parse the front matter.
 * If successful, the document will be returned as a String with an attached
 * graph with the front matter and document content as data.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadTextWithFrontMatter(buffer, key) {
  const text = String(buffer);

  const frontMatter = extractFrontMatter(text);
  if (!frontMatter) {
    // Didn't find, or couldn't parse, front matter
    return text;
  }

  const { frontData, bodyText } = frontMatter;
  const scope = this;

  const deferredGraph = new DeferredGraph(() => {
    const graph = new (MetaTransform(ObjectGraph))(frontData);
    graph.parent = scope;
    return graph;
  });

  const textWithGraph = new StringWithGraph(bodyText, deferredGraph);

  return textWithGraph;
}
