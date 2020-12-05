import { JsonStorage } from "@explorablegraph/integrations";

export default async function storage(id) {
  return new JsonStorage(id);
}
