import ExplorableObject from "../../core/ExplorableObject.js";

export default async function explore(obj) {
  return new ExplorableObject(obj);
}

explore.usage = `explore(obj)\tMake a plain JavaScript object explorable`;
