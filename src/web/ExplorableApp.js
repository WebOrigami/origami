import DefaultValues from "../../src/common/DefaultValues.js";
import WildcardKeysMixin from "../../src/common/WildcardKeysMixin.js";
import CommonFileTypesMixin from "../../src/node/CommonFileTypesMixin.js";
import Files from "../../src/node/Files.js";
import VirtualKeysMixin from "../../src/node/VirtualKeysMixin.js";
import VirtualValuesMixin from "../../src/node/VirtualValuesMixin.js";
import defaultIndexHtml from "./defaultIndexHtml.js";

class AppGraph extends CommonFileTypesMixin(
  WildcardKeysMixin(VirtualKeysMixin(VirtualValuesMixin(Files)))
) {}

export default class ExplorableApp extends DefaultValues {
  constructor(dirname) {
    const main = new AppGraph(dirname);
    const defaults = {
      "index.html": defaultIndexHtml,
    };
    super(main, defaults);
  }
}
