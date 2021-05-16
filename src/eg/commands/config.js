// This should be set by the eg command.
let scope;

export default function config() {
  return scope;
}
config.usage = `config()\tReturn the graph for the active eg configuration`;

config.setScope = function (obj) {
  scope = obj;
};
