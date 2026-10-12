# Third-party infrastructure files

`chromium-seccomp.json` is derived from Microsoft Playwright v1.64.0:
https://github.com/microsoft/playwright/blob/v1.64.0/utils/docker/seccomp_profile.json

Local change: the user-namespace rule also allows the `chroot` syscall. With all outer container capabilities dropped, Chromium needs this syscall inside its new user namespace to finish sandbox setup; this does not grant the container the host capability.

Its license is included as `PLAYWRIGHT-LICENSE.txt`. This profile permits Chromium user-namespace operations while retaining an allowlist-based syscall policy. Review compatibility with your runtime before deployment. It does not enforce network isolation or replace browser/container patching.
