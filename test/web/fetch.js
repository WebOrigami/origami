import fetch from "../../src/web/fetch.js";

const buffer = await fetch("https://example.com");
const text = String(buffer);
console.log(text);
