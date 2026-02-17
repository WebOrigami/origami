This folder implements the Origami debugger, a local web server whose architecture is complex enough to warrant documenting here.

## Design goals

1. Easily start a debug server. An Origami dev can start a server with `ori debug2 <expression>, [port]`, where `<expr>` is an Origami expression yielding a map-based tree and `port` is an optional port (default: 5000). This command should start the server and display console text indicating that the server is running on the indicated port. The dev can browse to that location to view their site.

2. Watch the local project for changes and reload accordingly. If the developer edits a file and refreshes the browser, they should see the result of their edit.

3. Load JavaScript code in a clean Node environment, and recreate a clean environment whenever the developer edits a file. If the dev edits a file `fn.js` to remove a global definition, the server should reload its state such that the old global is gone.

4. Deliver reasonable performance for local development. Minimize the amount of interprocess communication (IPC) where possible.

5. Keep the architecture simple enough that it's reliable and maintainable.

## Architecture

Goal #1 (easily start server) implies that the parent debug2 process is the one establishing the server port number that the dev can see, and that the port number is kept stable across reloads.

To achieve goal #3 (clean Node environment), the debug2 command loads the Origami project in a child process that can be killed and restarted on each reload.

These points are in tension: it would be faster (goal #4) for the child process to directly respond to requests, but it's impossible for that port number to be stable while also having a clean Node environment.

As a reliable and maintainable compromise (goal #5), the child process starts its own server on an ephemeral local port. (An ephemeral port has a port number is dynamically chosen by the OS from a designated range, and which is expected to be used only for a short period of time.) The child then communicates its port number to the parent process. The parent's server (the one the dev can see) then uses that port to proxy HTTP requests to the child's server. The parent is acting as a _reverse proxy_.

Requests are routed to the resource tree as follows:

browser → parent server → child server → tree → child server → parent server → browser

When the local project changes, the parent server creates a new child process and begins routing requests to it. In the background, it tells the previous child to drain any in-flight requests; when that's complete, the child process is killed.
