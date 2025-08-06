import { text as treeText } from "@weborigami/async-tree";
import builtinsJse from "./builtinsJse.js";
import * as dev from "./dev/dev.js";
import * as image from "./image/image.js";
import * as origami from "./origami/origami.js";
import explore from "./protocols/explore.js";
import files from "./protocols/files.js";
import http from "./protocols/http.js";
import https from "./protocols/https.js";
import httpstree from "./protocols/httpstree.js";
import httptree from "./protocols/httptree.js";
import node from "./protocols/node.js";
import packageNamespace from "./protocols/package.js";
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
      image,
      ...origami,
      ...site,
      static: site.staticBuiltin,
      ...text,
    };

    const Protocol = {
      explore,
      files,
      http,
      https,
      httpstree,
      httptree,
      node,
      package: packageNamespace,
    };

    builtins = {
      // All JSE builtins
      ...builtinsJse(),

      // Dev builtins exposed at the top level in shell
      ...dev,

      Dev: dev,
      Origami,
      Protocol,
      Tree,
    };
  }

  return builtins;
}
