# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

loco-cli is a Node.js CLI tool for syncing translation assets between a project and Loco (localise.biz). Three main commands: `pull` (download translations), `push` (upload translations), `status` (show diff).

## Common Commands

```bash
pnpm build         # TypeScript compilation to dist/
pnpm test          # Run all tests with vitest
pnpm lint          # ESLint
pnpm format        # Prettier write
pnpm format:check  # Prettier check
pnpm loco-cli      # Build and run the CLI locally for testing
```

## Architecture

```
cli.ts                    # Entry point, defines commands with commander
  ↓
src/commands/             # Command implementations (pull, push, status)
  ↓
src/lib/                  # Core business logic
  ├── api.ts              # Loco API interaction (fetch wrapper)
  ├── readFiles.ts        # Read local JSON translation files
  ├── writeFiles.ts       # Write local JSON translation files
  ├── diff.ts             # Compare local vs remote translations
  └── dotObject.ts        # Convert nested objects to dot-notation for API
  ↓
src/util/                 # Helper utilities
  ├── config.ts           # Load config via cosmiconfig
  ├── options.ts          # Merge CLI options with config file
  ├── logger.ts           # Colorized console output
  ├── print.ts            # Format diff output
  ├── namespaces.ts       # Split dot-notation back to nested objects
  └── handleAsyncErrors.ts # Error handling wrapper for commands
```

## Key Data Flow

All three commands follow similar pattern:
1. `readFiles()` loads local JSON translations
2. `apiPull()` fetches remote translations from Loco
3. `diff()` compares the two sets
4. Command-specific action (write files, push to API, or just print)

## Translation File Formats

**Without namespaces** (flat):
```
locales/en.json, locales/es.json
```

**With namespaces** (nested folders):
```
locales/en/common.json, locales/en/home.json
```

Nested JSON is flattened to dot-notation when communicating with Loco API.

## Code Style

- 2-space indent, 100 char width, single quotes, semicolons required
- Arrow parens avoided (`x => x` not `(x) => x`)
- No trailing commas
- Prefer typed code over `any`
- No barrel exports; use explicit imports from specific files
