import process from "process";

export default async function stdin() {
  return await readAll(process.stdin);
}

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
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
  });
}

stdin.usage = `stdin\tReturns the contents of the standard input stream`;
stdin.documentation = "https://explorablegraph.org/cli/builtins.html#stdin";
