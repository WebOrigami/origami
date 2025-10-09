import { builtins } from "@weborigami/language";
import * as dev from "./dev/dev.js";
import help from "./dev/help.js";
import * as origami from "./origami/origami.js";

let initialized = false;

/**
 * Pass the Origami builtins to the compiler.
 */
export default function initializeBuiltins() {
  if (!initialized) {
    const origamiBuiltins = {
      Dev: dev,
      Origami: origami,
      "help:": help,
    };

    Object.assign(builtins, origamiBuiltins);
  }

  initialized = true;
}
