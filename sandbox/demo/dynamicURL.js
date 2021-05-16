import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(dirname, "greet.js");
const buffer = await fs.readFile(filePath);
const url = `data:text/javascript,${buffer}`;
// Alas, the imported JS can't include relative imports.
const { default: result } = await import(url);
console.log(result);
