import * as utilities from "../core/utilities.js";

export default async function parse(text) {
  return text ? utilities.parse(String(text)) : undefined;
}

parse.usage = `parse <text>\tParse text as JSON or YAML into an object`;
parse.documentation = "https://explorablegraph.org/cli/builtins.html#parse";
