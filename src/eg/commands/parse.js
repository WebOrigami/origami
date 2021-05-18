import ExplorableObject from "../../core/ExplorableObject.js";

export default async function parse(text) {
  const obj = JSON.parse(text);
  return new ExplorableObject(obj);
}

parse.usage = `parse(text)\tParse text as JSON`;
