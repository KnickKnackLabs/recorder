# recorder

Tooling for extracting transcripts from [Google Recorder](https://recorder.google.com) via browser automation.

Google Recorder has no API. This tool uses [shimmer](https://github.com/ricon-family/shimmer)'s browser infrastructure to navigate the app's Shadow DOM and extract recording metadata and transcripts.

## Installation

```bash
shiv install recorder
```

Or point shiv at a local clone:

```bash
shiv install recorder /path/to/recorder
```

## Prerequisites

- [shimmer](https://github.com/ricon-family/shimmer) must be installed and accessible
- Browser auth for recorder.google.com must be set up: `shimmer browser:login recorder.google.com`

## Usage

```bash
# List all recordings with metadata
recorder transcript:list

# Get the transcript for a specific recording
recorder transcript:get "Feb 18 at 15:10"
```

Both commands output JSON to stdout.

## Architecture

Recorder defines [mise](https://mise.jdx.dev) tasks as its public API. Internally, those tasks invoke `shimmer browser:run` with scripts that navigate Google Recorder's Shadow DOM.

Patchright (the browser engine) is shimmer's dependency, not recorder's.

```
recorder/
├── mise.toml
├── .mise/tasks/transcript/
│   ├── list
│   └── get
└── scripts/
    ├── list-recordings.mjs
    └── get-transcript.mjs
```
