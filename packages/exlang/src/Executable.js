import { Explorable, get } from "@explorablegraph/exfn";
import { argumentMarker as marker, default as execute } from "./execute.js";

// TODO: extends ExplorableArray
export default class Executable extends Explorable {
  constructor(exfn) {
    super();
    this.exfn = exfn;
  }

  // TODO: use key as arg to functions.
  [get](key) {
    return execute(this.exfn, key);
  }
}

export const argumentMarker = marker;
