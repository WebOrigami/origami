import FrontMatterDocument from "../../common/FrontMatterDocument.js";

export default function set(value, frontData) {
  return new FrontMatterDocument(value, { frontData });
}
