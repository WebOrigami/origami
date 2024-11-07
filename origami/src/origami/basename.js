import { extname } from "@weborigami/language";

export default function basename(key) {
  const ext = extname(key);
  return ext ? key.slice(0, -ext.length) : key;
}
basename.description =
  "basename(key) - Removes an extension from the key if present";
