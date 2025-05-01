import oriHandler from "./ori.handler.js";

export default {
  ...oriHandler,

  async unpack(packed, options = {}) {
    return oriHandler.unpack(packed, {
      ...options,
      mode: "jse",
    });
  },
};
