import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import * as serialize from "../../common/serialize.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 *
 * @param {StringLike} text
 * @this {AsyncTree|null}
 */
export default async function fromYaml(text) {
  assertScopeIsDefined(this);
  let result = text ? serialize.parseYaml(String(text)) : undefined;
  if (this && Tree.isAsyncTree(result)) {
    result = Scope.treeWithScope(result, this);
  }
  return result;
}

fromYaml.usage = `fromYaml <text>\tParse text as YAML`;
fromYaml.documentation = "https://weborigami.org/cli/builtins.html#fromYaml";
