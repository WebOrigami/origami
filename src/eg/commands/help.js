import child_process from "child_process";

export default function help(name) {
  const anchor = name ? `#${name}` : "";
  const url = `https://explorablegraph.org/eg/commands.html${anchor}`;
  const platform = process.platform;
  const start =
    platform === "darwin"
      ? "open"
      : platform === "win32"
      ? "start"
      : "xdg-open";
  const command = `${start} ${url}`;
  child_process.exec(command);
}

help.usage = `help(name)\tOpens documentation for the named command`;
