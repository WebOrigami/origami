import * as compile from "../../src/compiler/compile.js";

export default async function oriEval(source) {
  const globals = {
    false: false,
    NaN: NaN,
    null: null,
    true: true,
    undefined: undefined,
  };
  const compiled = compile.program(source, { globals });
  const result = await compiled();
  return result;
}
