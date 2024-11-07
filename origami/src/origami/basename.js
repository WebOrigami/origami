import { extname } from "@weborigami/language";
import helpRegistry from "../common/helpRegistry.js";

export default function basename(key) {
  const ext = extname(key);
  return ext ? key.slice(0, -ext.length) : key;
}

helpRegistry.set(
  "origami:basename",
  "(key) - Removes an extension from the key if present"
);
