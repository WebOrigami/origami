import { Tree } from "@graphorigami/core";
import { Scope } from "@graphorigami/language";
import * as serialize from "../../common/serialize.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("@graphorigami/core").StringLike} StringLike
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
fromYaml.documentation = "https://graphorigami.org/cli/builtins.html#fromYaml";
