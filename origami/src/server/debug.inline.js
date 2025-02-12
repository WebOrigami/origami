/* This file is inlined into the debug template page */

let resultFrame;
let resultPath;
let sourceFilePath;
let trace;

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
  const traceHtml = await traceResponse.json();
  console.log(traceHtml);

  // let basePath = `/.results${resultPathname}`;
  // if (basePath.endsWith("/")) {
  //   basePath = basePath.slice(0, -1);
  // }

  // sourceFilePath.textContent = new URL(url).pathname;
  trace.innerHTML = traceHtml;
  resultPath.textContent = resultPathname;

  trace.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mouseover", (event) => {
      event.target.classList.add("highlight");
      let current = event.target.parentElement;
      while (current) {
        current.classList.remove("highlight");
        current = current.parentElement;
      }
    });
    span.addEventListener("click", (event) => {
      document.querySelectorAll(".selected").forEach((selected) => {
        selected.classList.remove("selected");
      });
      event.target.classList.add("selected");
    });
    span.addEventListener("mouseleave", (event) => {
      event.target.classList.remove("highlight");
    });
  });
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
