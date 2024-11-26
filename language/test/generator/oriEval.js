import { ObjectTree } from "@weborigami/async-tree";
import * as compile from "../../src/compiler/compile.js";

export default async function oriEval(source) {
  const builtins = new ObjectTree({
    false: false,
    NaN: NaN,
    null: null,
    true: true,
    undefined: undefined,
  });
  const compiled = compile.program(source);
  const result = await compiled.call(builtins);
  return result;
}
