// .css files use the .txt loader
import { txtHandler } from "./handlers.js";

export default {
  ...txtHandler,
  mediaType: "text/css",
};
