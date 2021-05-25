// Manual test for the fetch implementation

import fetch from "../../src/core/fetch.js";

const buffer = await fetch("https://example.com");
const text = String(buffer);
console.log(text);
