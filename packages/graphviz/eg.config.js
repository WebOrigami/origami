// import { builtins } from "@explorablegraph/eg";

import { Explorable } from "@explorablegraph/core";

// export default builtins;

function foo(x) {
  return `${x}${x}`;
}

foo.usage = "foo(x) Foo the thing";

export default Explorable({
  foo,
});
