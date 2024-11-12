import { toString } from "../common/utilities.js";

export default async function jsonParse(input) {
  const text = toString(input);
  return text ? JSON.parse(text) : undefined;
}
