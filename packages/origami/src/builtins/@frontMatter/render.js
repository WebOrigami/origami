import TextWithContents from "../../common/TextWithContents.js";
import { renderFrontMatter } from "../../common/serialize.js";

export default async function render(value, data) {
  /** @type {any} */
  const textFile = new TextWithContents(value, () => data);
  return renderFrontMatter(textFile);
}
