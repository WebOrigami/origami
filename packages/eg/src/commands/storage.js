import { JsonStorage } from "../../../integrations/exports.js";

export default async function storage(id) {
  return new JsonStorage(id);
}
