import * as utilities from "../../core/utilities.js";

export default async function parse(text) {
  return utilities.parse(text);
}

parse.usage = `parse(text)\tParse text as JSON or YAML into an object`;
