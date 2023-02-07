import OrigamiTemplate from "../framework/OrigamiTemplate.js";

/**
 * Load a file as an Origami template.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadOri(buffer, key) {
  return new OrigamiTemplate(String(buffer), this);
}
