//
// This library includes a number of modules with circular dependencies. This
// module exists to explicitly set the loading order for those modules. To
// enforce use of this loading order, other modules should only load the modules
// below via this module.
//
// About this pattern:
// https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de
//
// Note: to avoid having VS Code auto-sort the imports, keep lines between them.

export { default as jsHandler } from "./handlers/js.handler.js";
export { default as tsHandler } from "./handlers/ts.handler.js";

export { default as oriHandler } from "./handlers/ori.handler.js";

export { default as jseHandler } from "./handlers/jse.handler.js";

export { default as oridocumentHandler } from "./handlers/oridocument.handler.js";

export { default as jsedocumentHandler } from "./handlers/jsedocument.handler.js";

export { default as txtHandler } from "./handlers/txt.handler.js";

export { default as cssHandler } from "./handlers/css.handler.js";
export { default as csvHandler } from "./handlers/csv.handler.js";
export { default as htmHandler } from "./handlers/htm.handler.js";
export { default as htmlHandler } from "./handlers/html.handler.js";
export { default as jpegHandler } from "./handlers/jpeg.handler.js";
export { default as jpgHandler } from "./handlers/jpg.handler.js";
export { default as jsonHandler } from "./handlers/json.handler.js";
export { default as mdHandler } from "./handlers/md.handler.js";
export { default as mjsHandler } from "./handlers/mjs.handler.js";
export { default as wasmHandler } from "./handlers/wasm.handler.js";
export { default as xhtmlHandler } from "./handlers/xhtml.handler.js";
export { default as yamlHandler } from "./handlers/yaml.handler.js";
export { default as ymlHandler } from "./handlers/yml.handler.js";
