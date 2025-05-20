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

export { default as jsHandler } from "./js.handler.js";
export { default as tsHandler } from "./ts.handler.js";

export { default as oriHandler } from "./ori.handler.js";

export { default as jseHandler } from "./jse.handler.js";

export { default as oridocumentHandler } from "./oridocument.handler.js";

export { default as jsedocumentHandler } from "./jsedocument.handler.js";

export { default as txtHandler } from "./txt.handler.js";

export { default as cssHandler } from "./css.handler.js";
export { default as csvHandler } from "./csv.handler.js";
export { default as htmHandler } from "./htm.handler.js";
export { default as htmlHandler } from "./html.handler.js";
export { default as jpegHandler } from "./jpeg.handler.js";
export { default as jpgHandler } from "./jpg.handler.js";
export { default as jsonHandler } from "./json.handler.js";
export { default as mdHandler } from "./md.handler.js";
export { default as mjsHandler } from "./mjs.handler.js";
export { default as wasmHandler } from "./wasm.handler.js";
export { default as xhtmlHandler } from "./xhtml.handler.js";
export { default as yamlHandler } from "./yaml.handler.js";
export { default as ymlHandler } from "./yml.handler.js";
