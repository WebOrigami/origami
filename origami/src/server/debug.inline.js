/* This file is inlined into the debug template page */

let resultFrame;
let resultPath;
let sourceFilePath;
let trace;

// Escape XML entities for in the text.
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Result has changed; refresh the trace
async function refreshTrace() {
  const resultLocation = resultFrame.contentDocument.location;
  const resultPathname = resultLocation.pathname;

  if (resultPathname.startsWith("/.results")) {
    // Don't trace the trace
    return;
  }

  const tracePathname = `/.links${resultPathname}`;
  const traceUrl = new URL(tracePathname, resultLocation.origin);
  const traceResponse = await fetch(traceUrl);
  const linkData = await traceResponse.json();
  console.log(linkData);

  let basePath = `/.results${resultPathname}`;
  if (basePath.endsWith("/")) {
    basePath = basePath.slice(0, -1);
  }
  const links = linkData
    .map((data) => {
      const text = escapeXml(data.text);
      return data.path
        ? `<a href="${basePath}${data.path}" target="result">${text}</a>`
        : text;
    })
    .join("");

  // sourceFilePath.textContent = new URL(url).pathname;
  trace.innerHTML = links;
  resultPath.textContent = resultPathname;
}

window.addEventListener("load", () => {
  resultFrame = document.getElementById("result");
  resultPath = document.getElementById("resultPath");
  sourceFilePath = document.getElementById("sourceFilePath");
  trace = document.getElementById("trace");

  if (!resultFrame) {
    console.error("Result frame not found");
    return;
  }

  resultFrame.addEventListener("load", () => {
    refreshTrace();
  });
  resultFrame.src = "/index.html";
});
