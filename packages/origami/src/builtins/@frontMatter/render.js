import { renderFrontMatter } from "../../common/serialize.js";

export default async function render(value, data) {
  /** @type {any} */
  const textFile = new String(value);
  textFile.contents = () => data;
  return renderFrontMatter(textFile);
}
