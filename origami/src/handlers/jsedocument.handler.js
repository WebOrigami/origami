import { oridocumentHandler } from "../internal.js";
import getParent from "./getParent.js";

let builtins;

export default {
  ...oridocumentHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    builtins ??= (await import("../builtinsNew.js")).default;
    return oridocumentHandler.unpack(packed, {
      ...options,
      globals: builtins,
      mode: "jse",
      parent,
    });
  },
};
