import addColons from "../common/addColons.js";
import * as deprecate from "../common/deprecate.js";
import equals from "./@equals.js";
import ifBuiltin from "./@if.js";
import * as math from "./@math.js";
import not from "./@not.js";
import or from "./@or.js";

export default {
  ...addColons({
    equals,
    if: ifBuiltin,
    not,
    or,
  }),

  ...deprecate.commands(math),
  "@equals": deprecate.command("calc:equals", "@equals", equals),
  "@if": deprecate.command("calc:if", "@if", ifBuiltin),
  "@not": deprecate.command("calc:not", "@not", not),
  "@or": deprecate.command("calc:or", "@or", or),
};
