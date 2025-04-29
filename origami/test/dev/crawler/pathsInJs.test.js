import assert from "node:assert";
import { describe, test } from "node:test";
import pathsInJs from "../../../src/dev/crawler/pathsInJs.js";

describe("pathsInJs", () => {
  test("find import/export paths", () => {
    const js = `
      import defaultExport       from "module-default.js";
      import * as name           from 'module-namespace.js';
      import { export1 }         from "module-named.js";
      import { export2 as alias2, export3 } from 'module-multiple.js';
      import 'module-side-effect.js';

      export { name1, name2 as aliasName } from "module-reexport.js";
      export * from 'module-all.js';
      export { default as defaultAlias }   from "module-default-reexport.js";

      // Paths inside comments shouldn't match
      // import "should/not/be-matched";

      /*
        export * from "should/not/be-here";
        import { x } from 'nor/this';
      */

      // Paths inside strings shouldn't match
      const str1 = "import 'not/a/module'";
      const str2 = 'export from "also/not/module"';
      const tpl  = \`import { x } from "template/string"\`;
      const rx = /import\s+['"]should\/not\/match['"]/;
    `;
    const paths = pathsInJs(js);
    assert.deepEqual(paths, {
      crawlablePaths: [
        "module-default.js",
        "module-namespace.js",
        "module-named.js",
        "module-multiple.js",
        "module-side-effect.js",
        "module-reexport.js",
        "module-all.js",
        "module-default-reexport.js",
      ],
      resourcePaths: [],
    });
  });
});
