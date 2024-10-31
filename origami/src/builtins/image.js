import * as deprecate from "../common/deprecate.js";
import format from "./@image/format.js";
import resize from "./@image/resize.js";

export default {
  format,
  resize,

  "@image": {
    format: deprecate.command("image:format", "@image/format", format),
    resize: deprecate.command("image:resize", "@image/resize", resize),
  },
};
