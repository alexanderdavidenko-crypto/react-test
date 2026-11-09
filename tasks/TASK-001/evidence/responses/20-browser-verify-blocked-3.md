Verdict: BLOCKED. I verified none of the browser scenarios, because `open` failed to start Chrome both inside and outside the sandbox.

### Context Summary
I ran the gate and tried `open` twice, once in the sandbox and once, as instructed, outside it. Both failed with the same error. As instructed, I tried no workaround such as `--no-sandbox`. I changed no code, documents, configs or dependencies, made no commits, and wrote no screenshots. I did not touch the dev server, and no adapter session was opened, so none needs closing.

### Evidence
- **Gate:** `node toolchain/bin/doctor.mjs --json` returned status DEGRADED.
  - Node 24.20.0: PASS.
  - Manifest: valid.
  - `capability:browser`: PASS (agent-browser@0.32.3 ready).
  - `hooks:claude`: ACTIVE.
  - `hooks:codex`: PENDING_ACTIVATION, which is not a blocker per your instructions.
  - No hook conflicts.
- **Environment:** `AGENT_BROWSER_EXECUTABLE_PATH=/opt/google/chrome/chrome` is present in the session.
- **Dev server:** `http://localhost:5173` returns HTTP 200. It belongs to the developer, and I left it alone.
- **Attempt 1:** `node toolchain/bin/agent-browser.mjs open http://localhost:5173`, in the sandbox, failed with:
  ```
  ✗ Chrome exited early (exit code: unknown) without writing DevToolsActivePort
  (also tried parsing stderr) Chrome exited before providing DevTools URL
  Chrome stderr:
    [139377:139377:1109/153801.212035:FATAL:content/browser/zygote_host/zygote_host_impl_linux.cc:144] No usable sandbox! If you are running on Ubuntu 23.10+ or another Linux distro that has disabled unprivileged user namespaces with AppArmor, see https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md. Otherwise see https://chromium.googlesource.com/chromium/src/+/main/docs/linux/suid_sandbox_development.md for more information on developing with the (older) SUID sandbox. If you want to live dangerously and need an immediate workaround, you can try using --no-sandbox.
  Hint: try --args "--no-sandbox" (required in containers, VMs, and some Linux setups)
  ```
- **Attempt 2:** the same command, run with the sandbox disabled, gave the identical `No usable sandbox!` FATAL at `zygote_host_impl_linux.cc:144` (pid 139461, 15:38:07).
- **Likely cause:** the AppArmor profile for `/opt/google/chrome/chrome` does not seem to be taking effect for the process the adapter launches. This is an inference from the error, not something I confirmed. Check on the host:
  - `/opt/google/chrome/chrome` exists and is the binary the AppArmor profile targets.
  - The profile is loaded and in enforce mode, for example `aa-status | grep chrome`.
  - `sysctl kernel.apparmor_restrict_unprivileged_userns` and the profile's `userns` permission allow Chrome to create user namespaces when the adapter spawns it.
  - The adapter may launch a different path (a bundled Chrome) instead of the `AGENT_BROWSER_EXECUTABLE_PATH` value.

### Not verified (everything, because Chrome never started)
- **List:**
  - columns at 1440 and stacked rows at 390
  - states loading, success, empty, no-match, error, network, malformed
  - URL filters, debounce, Back/Forward
  - M-2, M-3, M-4
- **Details:**
  - dialog focus, Esc, inert background
  - 404 (M-5)
  - error with "Try again"
  - date formats
- **Create form:**
  - open from header and from empty
  - defaults and validation
  - dirty-form close confirmation
  - success, "Open session", "Create another", "Clear filters"
  - create-error and coaches-error
- **Accessibility:**
  - keyboard order and focus visibility (including M-1)
  - reduced motion
  - 44px touch targets and 16px field font at 390
  - safe-area
- **Contrast:** no computed-style measurements.
- **Console and network:** no observations.
- **Screenshots:** `populated-desktop.png` and `populated-mobile.png` do not exist.

There are no defects to report, since nothing was observed.

### Next Step
Fix the host Chrome and AppArmor setup so that Chrome launched from `/opt/google/chrome/chrome` can create its sandbox, with no `--no-sandbox`. Then re-run `/browser-verify` for TASK-001. If the developer wants a quick check first, running `node toolchain/bin/agent-browser.mjs open http://localhost:5173` in their own shell shows whether the problem is the host or the agent environment.