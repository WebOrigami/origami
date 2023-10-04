import TextDocument from "../../common/TextDocument.js";

export default async function get(text) {
  const document = new TextDocument(text);
  return document.data;
}
