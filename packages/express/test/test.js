import { Explorable } from "@explorablegraph/core";
import express from "express";
import router from "../src/router.js";

// Create an express server.
const app = express();

// Can define whatever express routes you want here, as in any express app.

// Create a little explorable graph.
const pages = new Explorable({
  a: "Hello, a.",
  b: "Hello, b.",
  c: "Hello, c.",
  "index.html": `
    <ul>
      <li><a href="a">a</a></li>
      <li><a href="b">b</a></li>
      <li><a href="c">c</a></li>
    </ul>
  `,
});

// Add a router for the explorable graph above.
app.use(router(pages));

const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
