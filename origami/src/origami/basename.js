import { extension } from "@weborigami/async-tree";

export default function basename(key) {
  const ext = extension.extname(key);
  return ext ? key.slice(0, -ext.length) : key;
}
