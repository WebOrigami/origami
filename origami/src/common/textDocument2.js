import { Tree, isPlainObject, merge } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import * as YAMLModule from "yaml";
import { parseYaml } from "./serialize.js";

// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Return a new TextDocument for the given input.
 *
 * If the input is already a TextDocument, a new copy will be returned.
 *
 * If the input is string-like, it will be used as the text for a new
 * TextDocument. This process will parse out any YAML or JSON front matter and
 * attach it to the document as data. The first line of the text must be "---",
 * followed by a block of JSON or YAML, followed by another line of "---". Any
 * lines following will be treated as the document text.
 *
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 *
 * @param {StringLike|AsyncTree} input
 */
export function from(input) {
  if (Tree.isAsyncTree(input)) {
    return Object.create(input);
  }

  const text = String(input);
  const regex =
    /^(---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<body>[\s\S]*$)/;
  const match = regex.exec(text);
  const frontData = match?.groups ? parseYaml(match.groups.frontText) : null;
  const body = match?.groups?.body ?? text;

  return bodyWithData(body, frontData);
}

/**
 *
 * @param {StringLike} input
 * @param {Treelike} [data]
 */
export function bodyWithData(input, data) {
  const body = String(input);
  const bodyData = {
    "@body": body,
  };

  // If data is present, merge it with the body data.
  let tree;
  if (isPlainObject(data)) {
    tree = Tree.from({ ...data, ...bodyData });
  } else if (data) {
    tree = merge(Tree.from(bodyData), data);
    // HACK
    let treeScope;
    Object.defineProperty(tree, "scope", {
      get() {
        if (!treeScope) {
          return tree.parent
            ? new Scope(tree, Scope.getScope(tree.parent))
            : tree;
        }
        return treeScope;
      },
      set(scope) {
        treeScope = scope;
        for (const t of tree.trees) {
          t.scope = scope;
        }
      },
    });
  } else {
    tree = Tree.from(bodyData);
  }

  tree.toString = () => body;
  return tree;
}
