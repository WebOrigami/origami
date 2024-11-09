import helpRegistry from "../common/helpRegistry.js";

async function fetchWrapper(resource, options) {
  const response = await fetch(resource, options);
  return response.ok ? await response.arrayBuffer() : undefined;
}

export default {
  Array,
  Boolean,
  Date,
  Error,
  Infinity,
  Intl,
  JSON,
  Map,
  Math,
  NaN,
  Number,
  Object,
  RegExp,
  Set,
  String,
  Symbol,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  false: false,
  fetch: fetchWrapper,
  isFinite,
  isNaN,
  null: null,
  parseFloat,
  parseInt,
  true: true,
  undefined: undefined,
};

helpRegistry.set("js:Array", " - JavaScript Array class");
helpRegistry.set("js:Boolean", " - JavaScript Boolean class");
helpRegistry.set("js:Date", " - JavaScript Date class");
helpRegistry.set("js:Error", " - JavaScript Error class");
helpRegistry.set("js:Infinity", " - JavaScript Infinity constant");
helpRegistry.set("js:Intl", " - JavaScript Intl object");
helpRegistry.set("js:JSON", " - JavaScript JSON object");
helpRegistry.set("js:Map", " - JavaScript Map class");
helpRegistry.set("js:Math", " - JavaScript Math object");
helpRegistry.set("js:NaN", " - JavaScript NaN constant");
helpRegistry.set("js:Number", " - JavaScript Number class");
helpRegistry.set("js:Object", " - JavaScript Object class");
helpRegistry.set("js:RegExp", " - JavaScript RegExp class");
helpRegistry.set("js:Set", " - JavaScript Set class");
helpRegistry.set("js:String", " - JavaScript String class");
helpRegistry.set("js:Symbol", " - JavaScript Symbol class");
helpRegistry.set("js:decodeURI", " - JavaScript decodeURI function");
helpRegistry.set(
  "js:decodeURIComponent",
  " - JavaScript decodeURIComponent function"
);
helpRegistry.set("js:encodeURI", " - JavaScript encodeURI function");
helpRegistry.set(
  "js:encodeURIComponent",
  " - JavaScript encodeURIComponent function"
);
helpRegistry.set("js:false", " - JavaScript false constant");
helpRegistry.set("js:fetch", " - JavaScript fetch function");
helpRegistry.set("js:isFinite", " - JavaScript isFinite function");
helpRegistry.set("js:isNaN", " - JavaScript isNaN function");
helpRegistry.set("js:null", " - JavaScript null constant");
helpRegistry.set("js:parseFloat", " - JavaScript parseFloat function");
helpRegistry.set("js:parseInt", " - JavaScript parseInt function");
helpRegistry.set("js:true", " - JavaScript true constant");
helpRegistry.set("js:undefined", " - JavaScript undefined constant");

helpRegistry.set("js:", "JavaScript classes and functions");
