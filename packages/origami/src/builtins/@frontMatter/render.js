import TextFile from "../../common/TextFile.js";
import { renderFrontMatter } from "../../common/serialize.js";

export default async function render(value, data) {
  /** @type {any} */
  const textFile = new TextFile(value, () => data);
  return renderFrontMatter(textFile);
}
