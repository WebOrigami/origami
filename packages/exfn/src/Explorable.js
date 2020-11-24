import { get } from "@explorablegraph/symbols";

// Use function syntax to define constructor so that we can support calling the
// constructor directly without `new` as a means of implicit conversion of
// objects to exfns.
export default function Explorable(obj) {
  const name = obj?.name ?? "world";
  if (!(this instanceof Explorable)) {
    return new Explorable({ name });
  } else {
    this.name = name;
    return this;
  }
}

// Default `get` implementation returns undefined for any key.
Explorable.prototype[get] = function (key) {
  return undefined;
};

// Default iterator implementation generates an empty list.
Explorable.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
