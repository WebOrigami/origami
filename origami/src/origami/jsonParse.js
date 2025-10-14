import { toString } from "@weborigami/async-tree";

export default async function jsonParse(input) {
  const text = toString(input);
  return text ? JSON.parse(text) : undefined;
}
