import { coreGlobals, HandleExtensionsTransform } from "@weborigami/language";
import SftpClient from "./SftpClient.js";
import SftpExecMap from "./SftpExecMap.js";
import SftpMap from "./SftpMap.js";

/**
 * Return an AsyncMap for the files in a remote SFTP server.
 *
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 *
 * @param {{ agent?: string, host: string, passphrase?: string, password?: string, path?: string, port?: number, privateKey?: string, shellAccess?: boolean, username?: string, userName?: string }} options
 * @returns {Promise<SftpMap>}
 */
export default async function sftp(options, state = {}) {
  const { agent, host, passphrase, password, port, privateKey, shellAccess } =
    options;
  const username = options.username ?? options.userName; // allow camelCase
  const path = options.path;

  const client = new SftpClient({
    agent,
    host,
    passphrase,
    password,
    privateKey,
    port,
    username,
  });

  const classFn = shellAccess ? SftpExecMap : SftpMap;
  const tree = new (HandleExtensionsTransform(classFn))({
    client,
    path,
  });

  // Set globals for extension handlers
  /** @type {any} */ (tree).globals = state?.globals || (await coreGlobals());

  return tree;
}
sftp.needsState = true;
