import { isPacked, toString } from "@weborigami/async-tree";
import posix from "node:path/posix";
import { Client as SshClient } from "ssh2";

/**
 * An SFTP client backed by ssh2
 *
 * This ensures that only one connection is active at a time, that the
 * connection is reused during a given active period of time, and that the
 * connection is closed after a period of inactivity.
 *
 * @param {{ agent?: string, host: string, passphrase?: string, password?: string, port?: number, privateKey?: string, username?: string }} options
 */
export default class SftpClient {
  constructor(options) {
    // Validate options
    let { agent, host, passphrase, password, port, privateKey, username } =
      options;

    if (!host) {
      throw new Error("sftp: You must specify a host option");
    }

    if (!username) {
      // Default to current user
      username =
        process.env.USER || process.env.LOGNAME || process.env.USERNAME;
    }

    if (isPacked(passphrase)) {
      passphrase = toString(passphrase);
      passphrase = passphrase.trim();
    }
    if (isPacked(password)) {
      password = toString(password);
      password = password.trim();
    }

    // Default to SSH agent
    agent ??= process.env.SSH_AUTH_SOCK;

    this.options = {
      agent,
      // debug: console.error,
      host,
      passphrase,
      password,
      port,
      privateKey,
      username,
    };

    this.client = null;
    this.sftp = null;

    this.connectionCount = 0;
    this.disconnectTimeout = null;
    this.connectionPromise = null;
    this.endPromise = null;
  }

  async callSftp(fnName, ...args) {
    await this.connect();
    try {
      return await new Promise((resolve, reject) => {
        this.sftp[fnName](...args, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    } finally {
      this.scheduleDisconnect();
    }
  }

  async connect() {
    this.connectionCount++;
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }
    if (this.connectionCount > 0 && this.connectionPromise === null) {
      if (this.endPromise) {
        await this.endPromise;
      }
      this.connectionPromise = new Promise((resolve, reject) => {
        const client = new SshClient();
        this.client = client;

        client.once("ready", () => {
          client.sftp((error, sftp) => {
            if (error) {
              this.connectionPromise = null;
              this.client = null;
              reject(error);
            } else {
              this.sftp = sftp;
              sftp.on("error", () => {});
              resolve(sftp);
            }
          });
        });

        client.once("error", (error) => {
          this.connectionPromise = null;
          this.client = null;
          reject(error);
        });

        client.on("close", () => {
          this.sftp = null;
          this.client = null;
          this.connectionPromise = null;
        });

        client.on("error", () => {});

        client.connect(this.options);
      });
    }
    return this.connectionPromise;
  }

  async exec(command, path) {
    await this.connect();
    try {
      return await new Promise((resolve, reject) => {
        // Prepend a cd command so it runs in the appropriate directory
        const fullCommand = path ? `cd ${path}\n${command}` : command;
        this.client.exec(fullCommand, (error, stream) => {
          if (error) {
            reject(error);
            return;
          }

          const chunks = [];
          stream.on("data", (chunk) => {
            chunks.push(chunk);
          });
          stream.on("close", () => {
            const buffer = Buffer.concat(chunks);
            const text = new TextDecoder().decode(buffer);
            resolve(text);
          });
          stream.on("error", (err) => {
            reject(err);
          });
        });
      });
    } finally {
      this.scheduleDisconnect();
    }
  }

  async get(path) {
    try {
      return await this.callSftp("readFile", path);
    } catch (/** @type {any} */ error) {
      if (error.code === 2) {
        // No such file or directory
        return undefined;
      }
      throw error;
    }
  }

  async mkdir(path) {
    const parts = path.split("/").filter(Boolean);
    let current = path.startsWith("/") ? "/" : "";

    for (const part of parts) {
      current = posix.join(current, part);

      try {
        await this.callSftp("mkdir", current);
      } catch (/** @type {any} */ error) {
        if (error.code === 4) {
          // SSH_FX_FAILURE: directory already exists; ignore
        } else {
          throw error;
        }
      }
    }
  }

  async put(value, path) {
    return this.callSftp("writeFile", path, value);
  }

  async readdir(path) {
    return this.callSftp("readdir", path);
  }

  async rmdir(path) {
    // SSH does not support recursive directory deletion, so we need to
    // implement it ourselves.
    const entries = await this.readdir(path);
    for (const entry of entries) {
      const child = `${path.replace(/\/$/, "")}/${entry.filename}`;
      if (entry.attrs.isDirectory()) {
        await this.rmdir(child);
      } else {
        await this.unlink(child);
      }
    }
    return this.callSftp("rmdir", path);
  }

  scheduleDisconnect() {
    if (this.connectionCount > 0) {
      this.connectionCount--;
    }
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
    }
    this.disconnectTimeout = setTimeout(async () => {
      if (
        this.connectionCount === 0 &&
        this.connectionPromise &&
        !this.endPromise
      ) {
        const client = this.client;
        if (client) {
          this.endPromise = new Promise((resolve) => {
            client.once("close", resolve);
            client.end();
          });
          await this.endPromise;
        }
        this.sftp = null;
        this.client = null;
        this.connectionPromise = null;
        this.endPromise = null;
      }
      this.disconnectTimeout = null;
    }, 100);
    if (this.disconnectTimeout.unref) {
      this.disconnectTimeout.unref();
    }
  }

  async unlink(path) {
    return this.callSftp("unlink", path);
  }
}
