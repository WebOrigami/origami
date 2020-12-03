import process from "process";

export default async function stdin() {
  return await textFromReadable(process.stdin);
}

function textFromReadable(readable) {
  return new Promise((resolve) => {
    const chunks = [];

    readable.on("readable", () => {
      let chunk;
      while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
      }
    });

    readable.on("end", () => {
      const content = chunks.join("");
      resolve(content);
    });
  });
}

stdin.usage = `stdin()                                Returns the standard input stream as text`;
