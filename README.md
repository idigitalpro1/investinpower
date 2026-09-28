# Invest in Power

Preview-only static website for the future `https://investinpower.org` property.

## Current status

- Static HTML, CSS, and minimal vanilla JavaScript.
- No database, CMS, server runtime, analytics, cookies, payments, or active form endpoint.
- Mission, audience, primary action, programs, ownership, contact, and privacy copy remain visibly marked placeholders.
- Canonical metadata is prepared for `https://investinpower.org`, but the domain must not be attached and DNS must not change until separately approved.

## Preview deployment

- URL: https://investinpower-2ruf91jna-5280menu.vercel.app
- Vercel deployment: `dpl_49HRPpWJaUg6DYe9zD4B3yV6eY6D`
- State: ready, preview target, no aliases
- `investinpower.org`: not attached; DNS unchanged

## Local review

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Validation

```bash
npm test
npm run validate:production
```

The preview validation passes while listing every unresolved bracketed placeholder. Production validation intentionally fails until approved copy, working contact details, and final non-preview labels replace every release gate.

## Review evidence

- Lighthouse (local mobile audit): performance 100, accessibility 100, SEO 100.
- [Desktop screenshot](docs/screenshots/investinpower-desktop.png)
- [Mobile screenshot](docs/screenshots/investinpower-mobile.png)

See [PLACEHOLDERS.md](PLACEHOLDERS.md) for the copy and ownership decisions still required.
