import { args } from "@weborigami/async-tree";
import { coreGlobals, HandleExtensionsTransform } from "@weborigami/language";
import SftpClient from "./SftpClient.js";
import SftpExecMap from "./SftpExecMap.js";
import SftpMap from "./SftpMap.js";

/**
 * Return an AsyncMap for files on an SFTP server.
 *
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 *
 * @param {{ agent?: string, host: string, passphrase?: string, password?: string, path?: string, port?: number, privateKey?: string, shellAccess?: boolean, username?: string }} options
 * @param {*} state
 * @returns {Promise<SftpMap>}
 */
export default async function sftp(options, state) {
  let {
    agent,
    host,
    passphrase,
    password,
    path,
    port,
    privateKey,
    shellAccess,
    username,
  } = await args.options(options, "Origami.sftp", {
    agent: { required: false },
    host: {},
    passphrase: { required: false },
    password: { required: false },
    path: { required: false },
    port: { required: false, type: "number" },
    privateKey: { required: false },
    shellAccess: { required: false, type: "boolean" },
    username: { required: false },
  });

  path = path ?? ".";

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
