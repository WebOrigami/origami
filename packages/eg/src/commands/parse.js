import { AsyncExplorable } from "@explorablegraph/core";

export default async function parse(text) {
  const obj = JSON.parse(text);
  return new AsyncExplorable(obj);
}

parse.usage = `parse(text)\tParse text as JSON`;
