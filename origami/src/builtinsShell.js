import { text as treeText } from "@weborigami/async-tree";
import builtinsJse from "./builtinsJse.js";
import * as dev from "./dev/dev.js";
import * as image from "./image/image.js";
import * as origami from "./origami/origami.js";
import files from "./protocols/files.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

let builtins;

export default function builtinsShell() {
  if (!builtins) {
    const Tree = {
      ...tree,
      indent: text.indent,
      json: origami.json,
      text: treeText,
    };

    const Origami = {
      files,
      image,
      ...origami,
      ...site,
      ...text,
    };

    builtins = {
      // All JSE builtins
      ...builtinsJse(),

      // Dev builtins exposed at the top level in shell
      ...dev,

      Dev: dev,
      Origami,
      Tree,
    };
  }

  return builtins;
}
