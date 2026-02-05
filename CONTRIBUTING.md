# Contributing to Loco CLI

## Development Setup

```bash
pnpm install
pnpm build
```

To test the CLI locally:

```bash
pnpm loco-cli <command>
```

## Before Submitting a PR

```bash
pnpm test
pnpm lint
pnpm format:check
```

## Code Style

- 2-space indent, 100 char width, single quotes, semicolons required
- Prefer typed code over `any`
- No barrel exports; use explicit imports

## Publishing (maintainers)

1. `npm version <major|minor|patch>`
2. `pnpm build`
3. `npm publish`
