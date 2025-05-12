import { builtinsNew, oridocumentHandler } from "../internal.js";
import getParent from "./getParent.js";

export default {
  ...oridocumentHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oridocumentHandler.unpack(packed, {
      ...options,
      globals: builtinsNew,
      mode: "jse",
      parent,
    });
  },
};
