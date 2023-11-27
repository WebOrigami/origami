import { Tree } from "@graphorigami/async-tree";
import { parseYaml } from "../../common/serialize.js";
import textDocument2 from "../../common/textDocument2.js";

/**
 * Load a file as text document with possible front matter.
 *
 * This process will parse out any YAML or JSON front matter and attach it to
 * the document as data. The first line of the text must be "---", followed by a
 * block of JSON or YAML, followed by another line of "---". Any lines following
 * will be treated as the document text.
 *
 * Any Origami expressions in the front matter will be evaluated and the results
 * incorporated into the document data.
 *
 * @type {import("@graphorigami/language").FileUnpackFunction}
 */
export default async function unpackText(input, options = {}) {
  const text = String(input);
  const regex =
    /^(---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<body>[\s\S]*$)/;
  const match = regex.exec(text);

  const body = match?.groups?.body ?? text;

  let frontData = match?.groups ? parseYaml(match.groups.frontText) : null;
  if (Tree.isAsyncTree(frontData)) {
    // The front matter contains Origami expressions; evaluate.
    frontData.parent = options.parent; // May be undefined
    frontData = await Tree.plain(frontData);
  }

  return textDocument2(body, frontData);
}
