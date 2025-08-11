let defaultPath;
let frame;

const modes = {
  Content: "",
  Index: "!indexPage",
  YAML: "!yaml",
  SVG: "!svg",
};

// Extract the path from the URL hash.
function getPathFromHash() {
  return window.location.hash.slice(1); // Remove `#`
}

function getModeFromLocation() {
  const href = document.location.href;
  const match = /[\/](?<command>\!(?:indexPage|yaml|svg))$/.exec(href);
  const command = match?.groups?.command ?? "";
  const mode =
    Object.keys(modes).find((key) => modes[key] === command) ?? "Content";
  return mode;
}

function removeDocumentPath(path) {
  const documentPath = document.location.pathname;
  if (path.startsWith(documentPath)) {
    // Remove the document path prefix.
    path = path.slice(documentPath.length);
  }
  if (path.startsWith("/")) {
    // Remove the leading slash.
    path = path.slice(1);
  }
  return path;
}

function selectMode(newMode) {
  const currentMode = getModeFromLocation();
  if (newMode !== currentMode) {
    const location = frame.contentDocument.location;
    let newPath =
      location.href === "about:blank"
        ? ""
        : removeDocumentPath(location.pathname);
    const currentExtension = modes[currentMode];
    if (currentExtension && newPath.endsWith(currentExtension)) {
      // Remove the current extension.
      newPath = newPath.slice(0, -currentExtension.length);
    }
    const newExtension = modes[newMode];
    const separator = newPath.endsWith("/") ? "" : "/";
    const newFullPath = `${newPath}${separator}${newExtension}`;
    setPath(newFullPath);
  }
}

function setPath(path) {
  // Show the indicated page in the frame.
  const abbreviatedPath = `/${path}`;
  const fullPath = `${document.location.pathname}/${path}`;
  const framePathname = frame.contentDocument.location.pathname;
  if (framePathname !== abbreviatedPath && framePathname !== fullPath) {
    // Use `replace` to avoid affecting browser history.
    frame.contentWindow.location.replace(fullPath);
  }

  // If the path ends with a file name corresponding to a mode, select
  // the corresponding mode button.
  const mode = getModeFromLocation();
  const selectedButtonId = `button${mode}`;
  scopeToolbar.querySelectorAll("button").forEach((button) => {
    const pressed = button.id === selectedButtonId ? "true" : "false";
    button.setAttribute("aria-pressed", pressed);
  });
}

// When hash changes, load the indicated page.
window.addEventListener("hashchange", () => {
  const hashPath = getPathFromHash();
  const newPath = hashPath !== undefined ? hashPath : defaultPath;
  if (newPath) {
    setPath(newPath);
  }
});

// Initialize
window.addEventListener("load", () => {
  // Refresh title on page load.
  frame = document.getElementById("frame");
  frame.addEventListener("load", () => {
    if (frame.contentDocument.location.href !== "about:blank") {
      document.title = frame.contentDocument.title;
      const newPath = removeDocumentPath(
        frame.contentDocument.location.pathname
      );
      const hash = `#${newPath}`;
      if (window.location.hash !== hash) {
        // Use `replace` to avoid affecting browser history.
        window.location.replace(hash);
      }
    }
  });

  buttonContent.addEventListener("click", () => {
    selectMode("Content");
  });
  buttonIndex.addEventListener("click", () => {
    selectMode("Index");
  });
  buttonYAML.addEventListener("click", () => {
    selectMode("YAML");
  });
  buttonSVG.addEventListener("click", () => {
    selectMode("SVG");
  });

  // Navigate to any path already in the hash.
  defaultPath = getPathFromHash();
  if (defaultPath) {
    setPath(defaultPath);
  }
});
