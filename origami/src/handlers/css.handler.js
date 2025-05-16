// .css files use the .txt loader
import { txtHandler } from "../internal.js";

export default {
  ...txtHandler,
  mediaType: "text/css",
};
