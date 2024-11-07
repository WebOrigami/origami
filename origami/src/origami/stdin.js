import process from "node:process";

export default async function stdin() {
  return readAll(process.stdin);
}
stdin.description = "stdin - Returns the content of the standard input stream";

function readAll(readable) {
  return new Promise((resolve) => {
    const chunks = [];

    readable.on("readable", () => {
      let chunk;
      while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
      }
    });

    readable.on("end", () => {
      const size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const buffer = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(buffer);
    });
  });
}
