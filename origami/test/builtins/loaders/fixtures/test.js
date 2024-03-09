import fs from "node:fs";
const wasmBuffer = fs.readFileSync("./add.wasm");

WebAssembly.instantiate(wasmBuffer).then((wasmModule) => {
  // Exported function live under instance.exports
  const { add } = wasmModule.instance.exports;
  const sum = add(5, 6);
  console.log(sum); // Outputs: 11
});
