import { Tree } from "@weborigami/async-tree";
import protocolGlobals from "../protocols/protocolGlobals.js";
import * as protocols from "../protocols/protocols.js";
import builtins from "./builtins.js";
import jsGlobals from "./jsGlobals.js";

export default async function coreGlobals() {
  const handlerGlobals = (await import("../handlers/handlerGlobals.js"))
    .default;
  return {
    ...jsGlobals,
    Tree,
    Protocol: protocols,
    ...protocolGlobals,
    ...handlerGlobals,
    ...builtins,
  };
}
