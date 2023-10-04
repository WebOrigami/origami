import TextDocument from "../../common/TextDocument.js";

export default async function render(text, data) {
  const document = new TextDocument(text, data);
  return document.pack();
}
