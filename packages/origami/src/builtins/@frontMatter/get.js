import TextDocument from "../../common/TextDocument.js";

export default async function get(text) {
  const document = TextDocument.from(text);
  return document.data;
}
