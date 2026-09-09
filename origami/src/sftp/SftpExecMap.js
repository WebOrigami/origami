import { setParent, Tree } from "@weborigami/async-tree";
import fs from "node:fs/promises";
import SftpMap from "./SftpMap.js";

// Read the script used for generating the manifest. See command notes below.
const manifestShPath = new URL("./manifest.sh", import.meta.url);
const manifestShBufer = await fs.readFile(manifestShPath);
const manifestSh = new TextDecoder().decode(manifestShBufer);

/**
 * Map driver for an SFTP server that supports command execution
 *
 * The base SftpMap class relies strictly on SFTP, but that's not efficient for
 * some operations. This class is used if the user has the ability to execute
 * commands on the remote server.
 *
 * The commands executed are somewhat constrained by the need to be compatible
 * with various remote shells. This includes:
 *
 * - avoiding comments
 * - keeping commands on a single line
 * - avoiding shell-specific syntax that may not be supported on all remote
 *   servers.
 */
export default class SftpExecMap extends SftpMap {
  // Takes advantage of executing commands on the remote SFTP server to create
  // child directories more efficiently than the base SftpClient can.
  async child(key) {
    const valuePath = this.pathForKey(key);

    // Command needs to
    // - delete any existing file (not directory) with the given path
    // - create the directory if it doesn't exist
    // Also see command notes above.
    const command = `test -f "${valuePath}" && rm "${valuePath}"; mkdir -p "${valuePath}"`;
    await this.client.exec(command);

    // Return an SftpMap for the new directory
    const child = Reflect.construct(this.constructor, [
      {
        client: this.client,
        path: valuePath,
      },
    ]);
    setParent(child, this);
    return child;
  }

  async delete(key) {
    const valuePath = this.pathForKey(key);

    // Command needs to
    // - delete the file or directory if it exists
    // - signal whether the deletion was successful (i.e., file/directory existed)
    // Also see command notes above.
    const command = `test -e "${valuePath}" && (rm -rf "${valuePath}"; echo true) || echo false`;
    const result = await this.client.exec(command);
    return result.trim() === "true";
  }

  async manifest() {
    const listing = await this.client.exec(manifestSh, this.path);

    // Listing is in a rudimentary YAML format of `<path>: <hash>` for files and
    // `<path>: {}` for empty directories. Convert to Origami's flat format.
    const flat = new Map();
    const lines = listing.split("\n");
    for (const line of lines) {
      if (!line) continue;
      const [path, hash] = line.split(": ");
      flat.set(path, hash === "{}" ? new Map() : hash);
    }

    const manifest = await Tree.inflatePaths(flat);
    return manifest;
  }
}
