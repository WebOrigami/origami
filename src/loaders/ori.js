import loadTextWithFrontMatter from "../common/loadTextWithFrontMatter.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Load a file as an Origami template.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadOri(buffer, key) {
  const textWithGraph = loadTextWithFrontMatter(buffer, key);
  return new OrigamiTemplate(textWithGraph, this);
}
