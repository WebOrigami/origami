import { extname } from "@weborigami/language";

export default function basename(key) {
  const ext = extname(key);
  return ext ? key.slice(0, -ext.length) : key;
}
