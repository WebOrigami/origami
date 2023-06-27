/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import loadTextWithFrontMatter from "../common/loadTextWithFrontMatter.js";
import { getScope, keySymbol } from "../common/utilities.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Load a file as an Origami template.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadOri(buffer, key) {
  const scope = this ? getScope(this) : null;
  const textWithGraph = loadTextWithFrontMatter.call(scope, buffer, key);
  const template = new OrigamiTemplate(textWithGraph, scope);
  template[keySymbol] = key;
  return template;
}
