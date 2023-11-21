import { Tree } from "@graphorigami/async-tree";
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
 * attach it to the document as data. The first line of the text must be
 * "---", followed by a block of JSON or YAML, followed by another line of
 * "---". Any lines following will be treated as the document text.
 *
 * @typedef {import("@graphorigami/async-tree").StringLike} StringLike
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 *
 * @param {StringLike|AsyncTree} input
 * @param {Treelike} [base]
 */
export default function textDocument(input, base) {
  if (Tree.isAsyncTree(input)) {
    return Object.create(input);
  }

  const text = String(input);
  const regex =
    /^(?<frontBlock>---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<bodyText>[\s\S]*$)/;
  const match = regex.exec(text);
  const body = match?.groups?.bodyText ?? text;
  const base = {
    "@body": body,
  };
  const data = match?.groups ? parseYaml(match.groups.frontText, base) : base;
  const tree = Tree.from(data);
  tree.toString = () => body;
  return tree;
}
