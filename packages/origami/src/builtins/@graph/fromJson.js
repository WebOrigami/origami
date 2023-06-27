import * as serialize from "../../common/serialize.js";

export default async function fromJson(text) {
  return text ? serialize.fromJson(text) : undefined;
}

fromJson.usage = `fromJson <text>\tParse text as JSON`;
fromJson.documentation = "https://graphorigami.org/cli/builtins.html#fromJson";
