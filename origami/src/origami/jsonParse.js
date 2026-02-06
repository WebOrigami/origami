import { args } from "@weborigami/async-tree";

/**
 * Parse the input as JSON.
 *
 * @param {import("@weborigami/async-tree").Stringlike} input
 */
export default async function jsonParse(input) {
  const text = args.stringlike(input, "Origami.jsonParse");
  return text ? JSON.parse(text) : undefined;
}
