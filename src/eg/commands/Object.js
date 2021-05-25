import ExplorableObject from "../../core/ExplorableObject.js";

export default async function object(obj) {
  return new ExplorableObject(obj);
}

object.usage = `Object(obj)\tMake a plain JavaScript object explorable`;
