import { Explorable } from "@explorablegraph/core";
// import { builtins, defaultModuleExport } from "@explorablegraph/eg";
import { builtins, defaultModuleExport } from "../eg/exports.js";
import dot from "./src/dot.js";

builtins;

function foo(x) {
  return `${x}${x}`;
}
foo.usage = "foo(x) Foo the thing";

export default Explorable({
  defaultModuleExport,
  dot,
  foo,
});
