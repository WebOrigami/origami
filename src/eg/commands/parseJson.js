import ExplorableObject from "../../core/ExplorableObject.js";

export default async function parseJson(text) {
  const obj = JSON.parse(text);
  return new ExplorableObject(obj);
}

parseJson.usage = `parseJson(text)\tParse text as JSON`;
