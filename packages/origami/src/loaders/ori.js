/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import TextWithContents from "../common/TextWithContents.js";
import { extractFrontMatter } from "../common/serialize.js";
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
 * @returns {Function}
 */
export default function loadOrigamiTemplate(buffer, key) {
  const scope = this ? getScope(this) : null;

  const { bodyText, frontData } = extractFrontMatter(buffer);
  const templateFile = frontData
    ? new TextWithContents(bodyText, frontData)
    : bodyText;
  const template = new OrigamiTemplate(templateFile, scope);
  template[keySymbol] = key;
  /** @this {AsyncDictionary|null} */
  function fn(input) {
    return template.apply.call(template, input, this);
  }
  fn[keySymbol] = key;
  return fn;
}
