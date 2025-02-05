/* This file is inlined into the debug template page */

let tracePane;
let resultFrame;

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
  const tracePathname = `/.trace${resultPathname}`;
  const traceUrl = new URL(tracePathname, resultLocation.origin);
  const trace = await fetch(traceUrl);
  const location = await trace.json();
  console.log(location);

  const { source, start, end } = location;
  const { text, url } = source;
  const prologue = text.slice(0, start.offset);
  const fragment = text.slice(start.offset, end.offset);
  const epilogue = text.slice(end.offset);

  const html = `${url}\n\n${escapeXml(prologue)}<mark>${escapeXml(
    fragment
  )}</mark>${escapeXml(epilogue)}`;
  tracePane.innerHTML = html;
}

window.addEventListener("load", () => {
  tracePane = document.getElementById("trace");
  resultFrame = document.getElementById("result");

  if (!resultFrame) {
    console.error("Result frame not found");
    return;
  }

  resultFrame.addEventListener("load", () => {
    refreshTrace();
  });
  resultFrame.src = "/index.html";
});
