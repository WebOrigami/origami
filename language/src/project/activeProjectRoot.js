let activeProjectRoot = null;

export function get() {
  return activeProjectRoot;
}

export function set(projectRoot) {
  activeProjectRoot = projectRoot;
}
