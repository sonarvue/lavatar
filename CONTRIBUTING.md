# Contributing

Small, focused pull requests are preferred.

## Local checks

```bash
npm install
npm run build
npm run registry:validate
```

For shader changes, include the seed and palette used for visual testing. Confirm that animated and reduced-motion modes both render, and avoid changes that send seed data over the network.

## Scope

Good contributions include browser compatibility fixes, accessibility improvements, additional documented palettes, performance work, and narrowly scoped shader improvements.

Open an issue before changing the public prop API or adding a runtime dependency.
