// .html files use the .txt loader
import txtHandler from "./txt.handler.js";

export default {
  ...txtHandler,
  mediaType: "text/html",
};
