import { get, keys } from "@explorablegraph/symbols";
import {
  default as ExplorablePlainObject,
  isPlainObject,
} from "./ExplorablePlainObject.js";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns.
export default function Explorable(obj) {
  if (isPlainObject(obj)) {
    return new ExplorablePlainObject(obj);
  } else if (this instanceof Explorable) {
    return this;
  } else {
    return new Explorable();
  }
}

// Default `get` implementation returns undefined for any key.
Explorable.prototype[get] = function (key) {
  return undefined;
};

// Default iterator implementation generates an empty list.
Explorable.prototype[keys] = Array.prototype[Symbol.iterator];
