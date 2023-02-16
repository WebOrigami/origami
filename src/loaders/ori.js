import loadTextWithFrontMatter from "../common/loadTextWithFrontMatter.js";
import { keySymbol } from "../core/utilities.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Load a file as an Origami template.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadOri(buffer, key) {
  const textWithGraph = loadTextWithFrontMatter.call(this, buffer, key);
  const template = new OrigamiTemplate(textWithGraph, this);
  template[keySymbol] = key;
  return template;
}
