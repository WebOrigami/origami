import YAML from "yaml";

export default async function parse(text) {
  return YAML.parse(text);
}

parse.usage = `parse(text)\tParse text as JSON or YAML into an object`;
