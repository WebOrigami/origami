import { createTextDocument } from "../../common/createTextDocument.js";

export default async function get(obj) {
  const document = createTextDocument(obj);
  return await document?.contents?.();
}
