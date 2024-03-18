import TextDocument from "../common/TextDocument.js";
import { evaluateYaml } from "../common/serialize.js";
import * as utilities from "../common/utilities.js";

/**
 * A text file with possible front matter
 *
 * The unpacking process will parse out any YAML or JSON front matter and attach
 * it to the document as data. The first line of the text must be "---",
 * followed by a block of JSON or YAML, followed by another line of "---". Any
 * lines following will be treated as the document text.
 *
 * Any Origami expressions in the front matter will be evaluated and the results
 * incorporated into the document data.
 */
export default {
  mediaType: "text/plain",

  /** @type {import("@weborigami/language").UnpackFunction} */
  async unpack(packed, options = {}) {
    const parent = options.parent ?? null;
    const text = utilities.toString(packed);
    if (!text) {
      throw new Error("Tried to treat something as text but it wasn't text.");
    }
    const regex =
      /^(---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<body>[\s\S]*$)/;
    const match = regex.exec(text);

    const body = match?.groups?.body ?? text;

    const frontData = match?.groups
      ? await evaluateYaml(match.groups.frontText, parent)
      : null;

    const object = Object.assign({}, frontData, { "@text": body });

    return new TextDocument(object, options.parent);
  },
};
