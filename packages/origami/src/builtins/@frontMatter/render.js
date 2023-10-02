import FrontMatterDocument from "../../common/FrontMatterDocument.js";

export default async function render(text, frontData) {
  const document = new FrontMatterDocument(text, { frontData });
  return String(document);
}
