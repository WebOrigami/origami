_I used an LLM to try to get the SFTP tests running on Windows, and it was partially successful. The core SftpMap tests pass, but the extended SftpExecMap tests don't all pass. I had the LLM document what it learned. -Jan_

# Configuring SFTP Tests

These tests assume an SFTP server is running locally and the current user has read/write access to the `fixtures` directory.

Prerequisites:

- SFTP server running on `localhost` (port 22 by default)
- SSH keys in `~/.ssh/` (id_ed25519, id_rsa, etc.) — SftpClient will auto-load them
- Current user has permissions on the SFTP server

## On macOS

- SSH agent runs by default and provides keys
- All tests pass without additional configuration

## On Windows

- SSH agent service (sshd) must be running
- By default, SSH keys are not auto-loaded; SftpClient provides fallback key loading

# Critical Windows Issues for Future Configuration

## SSH Key Auto-Loading

**Problem:** Windows doesn't auto-load SSH keys like macOS does.

**Solution Already Implemented:** SftpClient now has a `defaultPrivateKey()` helper that auto-loads keys from `~/.ssh/` if none are provided. This is called automatically and doesn't require user action.

**For Future Maintainers:** If authentication fails on Windows, check that SSH keys exist in `~/.ssh/` (id_ed25519, id_rsa, etc.). The fallback loading is synchronous and happens during connection setup.

## Shell Command Execution on Windows

**Problem:** Windows OpenSSH hardcodes `cmd.exe` for `ssh exec` commands, ignoring any shell configuration. SftpExecMap tests require bash commands (`test -f`, `mkdir -p`, `rm -rf`) which don't exist in Windows CMD.

**Root Cause:** This is an architectural difference. Windows OpenSSH:

- Spawns `cmd.exe` directly for all `ssh exec` commands
- Does not consult sshd_config `Shell` option (Windows-only limitation)
- Registry keys like `HKEY_LOCAL_MACHINE\SOFTWARE\OpenSSH\Users\<username>\Shell` apply only to interactive login shells, not exec
- The `ForceCommand` sshd_config option replaces user commands instead of executing them through a shell

**Solution:** Tests that require shell commands are automatically skipped on Windows (see `skipOnWindows` helper in SftpExecMap.test.js).

**For Future Maintainers:** If you need to enable SftpExecMap tests on Windows, options are:

1. **Rewrite commands in Windows CMD syntax** — Replace `test -f`, `mkdir -p`, `rm -rf` with Windows equivalents; most feasible but requires code refactoring
2. **Use WSL** — Requires installing WSL and uncertain if Windows OpenSSH would use it correctly
3. **Use Git Bash locally** — Won't help with remote SFTP exec commands

The current approach (skip on Windows) is pragmatic because core SFTP file I/O works perfectly on Windows; shell execution is a secondary feature.
