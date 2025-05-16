// .md files use the .txt loader
import { txtHandler } from "../internal.js";

export default {
  ...txtHandler,
  mediaType: "text/markdown",
};
