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

1. Go to Actions → Release workflow
2. Click "Run workflow"
3. Select version type (patch/minor/major)

The workflow runs tests, bumps the version, publishes to npm (via OIDC trusted publishing), and creates a GitHub Release.

**Setup:** Configure trusted publishing at https://www.npmjs.com/package/loco-cli/settings by linking to GitHub Actions with workflow `release.yml`.
