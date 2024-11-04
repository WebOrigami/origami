import * as deprecate from "../common/deprecate.js";
import breakpoint from "./@breakpoint.js";
import changes from "./@changes.js";
import code from "./@code.js";
import debug from "./@debug.js";
import explore from "./@explore.js";
import log from "./@log.js";
import serve from "./@serve.js";
import svg from "./@svg.js";
import watch from "./@watch.js";

export default deprecate.commands({
  breakpoint,
  changes,
  code,
  debug,
  explore,
  log,
  serve,
  svg,
  watch,
});
