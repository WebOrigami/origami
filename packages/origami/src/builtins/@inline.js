import TextFile from "../common/TextFile.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import loadOrigamiTemplate from "../loaders/orit.js";

/**
 * Inline any Origami expressions found inside {{...}} placeholders in the input
 * text.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {AsyncDictionary|null}
 * @param {StringLike} input
 */
export default async function inline(input) {
  assertScopeIsDefined(this);
  const template = await loadOrigamiTemplate(this, input);
  const fn = await template.contents();
  const bodyText = await fn.call(this);
  const frontMatter = await TextFile.frontMatter(input);
  const result = frontMatter
    ? `---\n${frontMatter}\n---\n${bodyText}`
    : bodyText;
  return new TextFile(result, { bodyText, contents: input.contents });
}

inline.usage = `@inline <text>\tInline Origami expressions found in the text`;
inline.documentation = "https://graphorigami.org/language/@inline.html";
