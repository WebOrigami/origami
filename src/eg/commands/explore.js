import ExplorableObject from "../../core/ExplorableObject.js";

export default async function explore(arg) {
  return ExplorableObject.explore(arg);
}

explore.usage = `explore(obj)\tMake a plain JavaScript object explorable`;
