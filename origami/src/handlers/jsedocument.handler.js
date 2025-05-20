import builtinsJse from "../builtinsJse.js";
import getParent from "./getParent.js";
import { oridocumentHandler } from "./handlers.js";

export default {
  ...oridocumentHandler,

  async unpack(packed, options = {}) {
    const parent = getParent(packed, options);
    return oridocumentHandler.unpack(packed, {
      ...options,
      globals: builtinsJse(),
      mode: "jse",
      parent,
    });
  },
};
