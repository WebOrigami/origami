/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import loadTextWithFrontMatter from "../common/loadTextWithFrontMatter.js";
import { getScope, keySymbol } from "../common/utilities.js";
import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Load a file as an Origami template.
 *
 * @typedef {import("../..").StringLike} StringLike
 *
 * @param {StringLike} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null|void}
 */
export default function loadOrigamiTemplate(buffer, key) {
  const scope = this ? getScope(this) : null;
  const templateFile = loadTextWithFrontMatter.call(scope, buffer, key);
  const template = new OrigamiTemplate(templateFile, scope);
  template[keySymbol] = key;
  return template;
}
