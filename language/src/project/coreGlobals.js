import { Tree } from "@weborigami/async-tree";
import protocolGlobals from "../protocols/protocolGlobals.js";
import * as protocols from "../protocols/protocols.js";
import jsGlobals from "./jsGlobals.js";

let globals;

export default async function coreGlobals() {
  if (globals) {
    return globals;
  }

  // Dynamic import to avoid circular dependency
  const handlerGlobals = await import("../handlers/handlers.js");

  let origamiBuiltins;
  if (!origamiBuiltins) {
    // This dynamic import is for a different reason. We want to load the
    // Origami builtins if they're available, but not fail if they're not. This
    // lets someone use the language package without installing the origami
    // package. This arrangement is unorthodox but expedient.
    try {
      origamiBuiltins = await import("@weborigami/origami");
    } catch {
      origamiBuiltins = {};
    }
  }

  globals = {
    ...jsGlobals,
    Tree,
    Protocol: protocols,
    ...protocolGlobals,
    ...handlerGlobals,
    ...origamiBuiltins,
  };

  return globals;
}
