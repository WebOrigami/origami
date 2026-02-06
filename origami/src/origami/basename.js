import { args, extension } from "@weborigami/async-tree";

export default function basename(key) {
  key = args.string(key, "Origami.basename");
  const ext = extension.extname(key);
  return ext ? key.slice(0, -ext.length) : key;
}
