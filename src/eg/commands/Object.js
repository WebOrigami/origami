import ExplorableObject from "../../core/ExplorableObject.js";

export default async function object(obj) {
  return new ExplorableObject(obj);
}

object.usage = `object(obj)\tMake a plain JavaScript object explorable`;
