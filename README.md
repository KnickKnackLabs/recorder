# recorder

Tooling for extracting audio recordings from [Google Recorder](https://recorder.google.com) via browser automation.

Google Recorder has no API. This tool uses [shimmer](https://github.com/KnickKnackLabs/shimmer)'s browser infrastructure to navigate the app's Shadow DOM and extract recordings.

## Installation

```bash
shiv install recorder
```

Or point shiv at a local clone:

```bash
shiv install recorder /path/to/recorder
```

## Prerequisites

- [shimmer](https://github.com/KnickKnackLabs/shimmer) must be installed and accessible
- Browser auth for recorder.google.com must be set up: `shimmer browser:login recorder.google.com`

## Usage

```bash
# List all recordings
recorder list
recorder list --json

# Download audio for one or more recordings
recorder download "Feb 18 at 15:10"
recorder download "Feb 18 at 15:10" "Feb 19 at 09:30" -o ~/recordings/

# Delete recordings after processing
recorder delete "Feb 18 at 15:10" "Feb 19 at 09:30"
```

## Architecture

Recorder defines [mise](https://mise.jdx.dev) tasks as its public API. Internally, those tasks invoke `shimmer browser:run` with scripts that navigate Google Recorder's Shadow DOM.

Patchright (the browser engine) is shimmer's dependency, not recorder's.

```
recorder/
├── mise.toml
├── .mise/tasks/
│   ├── list
│   ├── download
│   ├── delete
│   └── welcome
└── scripts/
    ├── list-recordings.mjs
    ├── download-recordings.mjs
    └── delete-recordings.mjs
```

## Design notes

Each command opens its own browser session — this keeps operations atomic and avoids session management complexity. `download` and `delete` accept multiple titles to batch work within a single session, so the typical agent workflow (list → download all → delete all) is exactly 3 browser launches regardless of recording count.

A long-lived browser session approach was considered and may be worth revisiting if the 3-session overhead becomes a bottleneck. The main challenges would be session lifecycle management (is the browser alive? did auth expire?) and page state recovery (is the page in a clean state after each operation?).
