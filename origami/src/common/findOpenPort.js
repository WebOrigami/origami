import net from "node:net";

const DEFAULT_PORT = 5000;

/**
 * Return the first open port number on or after the given port number.
 *
 * @param {number} startPort
 * @returns {Promise<number>}
 */
export async function findOpenPort(startPort = DEFAULT_PORT) {
  for (let port = startPort; port <= 65535; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No open port found on or after ${startPort}`);
}

/**
 * Check whether a port is available on both IPv4 and IPv6 loopback addresses
 * by attempting TCP connections. On macOS, IPv4 and IPv6 port spaces are
 * independent (IPV6_V6ONLY=1 by default), so a server bound to [::]:PORT is
 * invisible to a 127.0.0.1 bind check. Using connect probes on both loopbacks
 * catches servers regardless of which protocol family they listen on. Any
 * connection error (ECONNREFUSED, EADDRNOTAVAIL, etc.) means nothing is
 * listening there, so the function is safe on systems without IPv6.
 *
 * @param {number} port
 * @returns {Promise<boolean>}
 */
async function isPortAvailable(port) {
  const [v4, v6] = await Promise.all([
    isPortListening("127.0.0.1", port),
    isPortListening("::1", port),
  ]);
  return !v4 && !v6;
}

/**
 * @param {string} host
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortListening(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection(port, host);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}
