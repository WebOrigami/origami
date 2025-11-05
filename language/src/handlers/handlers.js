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

export { default as js_handler } from "./js_handler.js";
export { default as ts_handler } from "./ts_handler.js";

export { default as ori_handler } from "./ori_handler.js";

export { default as oridocument_handler } from "./oridocument_handler.js";

export { default as txt_handler } from "./txt_handler.js";

export { default as css_handler } from "./css_handler.js";
export { default as csv_handler } from "./csv_handler.js";
export { default as htm_handler } from "./htm_handler.js";
export { default as html_handler } from "./html_handler.js";
export { default as jpeg_handler } from "./jpeg_handler.js";
export { default as jpg_handler } from "./jpg_handler.js";
export { default as json_handler } from "./json_handler.js";
export { default as md_handler } from "./md_handler.js";
export { default as mjs_handler } from "./mjs_handler.js";
export { default as sh_handler } from "./sh_handler.js";
export { default as wasm_handler } from "./wasm_handler.js";
export { default as xhtml_handler } from "./xhtml_handler.js";
export { default as yaml_handler } from "./yaml_handler.js";
export { default as yml_handler } from "./yml_handler.js";
