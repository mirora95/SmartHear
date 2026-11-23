# Audio-startup acceptance

Use this guide when reviewing [audio cleanup PR #2](https://github.com/mirora95/SmartHear/pull/2). It describes expected behavior, not completed browser or hardware test results.

## Choose the checkout

The automated commands below require PR #2's `fix/audio-start-cleanup-2026-10-22` branch, verified at `ff8f1d286a1836ee628a0d178716c840322d2a1c`. The separate documentation branch does **not** contain its test script or implementation. Record the actual commit under review if either branch changes.

From that implementation checkout, with Node.js 22 and dependencies installed:

```sh
npm test
npm run lint
npm run build -- --outDir ../SmartHear-review-build
```

The external build directory preserves the tracked `dist/` files. For local browser setup, see [Local development](../README.md#local-development). Use the app entry `/SmartHear/app.html` on localhost. Use a local test checkout without a Gemini key; these checks need no provider request. Comm Mode and speech recognition are outside this guide.

## Manual observations

Use a browser/test context prepared by the tester. Only the tester chooses whether to allow microphone access. Record browser/version, commit, permission outcome, action order, and observed result for each case. Mark cases not run or not reproducible rather than treating them as passes.

The Dashboard's microphone control is the round sound icon beside the title; it has no Start/Stop text label. The inactive control starts monitoring and the active control stops it.

| Case | Action | Expected observation |
| --- | --- | --- |
| Initial page | Load the app without using the microphone control. | Dashboard is quiet at zero; opening the app does not itself begin capture. |
| Permission denied | Use the control and decline the request. | An error toast appears and the app does not show active monitoring. The page remains usable. |
| Permission allowed, then stop | In an allowed test context, start monitoring, observe changing levels, then use the active control to stop. | Monitoring becomes inactive, the displayed level returns to zero/quiet, and capture ends for this test tab. |
| Repeated start while permission is pending | If the browser permits it, use the inactive control again before the first request resolves, then complete the requests and stop the resulting monitor. | The app settles into a usable current monitor, and stopping it does not later turn monitoring back on when an older request completes. Record whether the browser coalesced requests; a coalesced prompt does not prove both orderings. |
| Retry after failure | Attempt another start after a failed request. | The app remains responsive. A successful request can start monitoring; another denied request stays inactive with an error. If denial is remembered, record that limit instead of changing permission settings as part of this run. |

A single visible meter does not prove that only one media stream exists. Record tab-specific capture evidence where the browser exposes it; otherwise leave lower-level stream ownership unverified. Closing a tab can release resources through browser teardown, so it does not independently verify the component's `stop()` cleanup.

## What the automated tests cover

`tests/audio.test.ts` in PR #2 uses mocked microphone, Web Audio, and animation-frame boundaries. Its seven cases cover:

- Track release when AudioContext construction fails.
- Stream/source/context release when source connection fails.
- Successful monitoring until explicitly stopped.
- Releasing a late permission grant after `stop()`, without creating an audio context or delivering data.
- An obsolete grant and an obsolete rejection leaving a newer monitor intact (two cases).
- Replacing an active monitor while releasing its previous resources.

These checks make permission ordering deterministic and assert disposal calls. They do not test native permission prompts, actual hardware, browser capture indicators, or React's visible monitoring state. The manual observations complement those boundaries; they do not replace the automated assertions.

## Review record

For each run, keep the exact head, commands/results, browser observations, and every unrun area together. A passing production build or page load alone is not microphone acceptance. Real Gemini, sound-classification accuracy, service-worker/offline behavior, and full network isolation remain separate checks.
