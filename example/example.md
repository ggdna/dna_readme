# Example

`dna_readme` is a DNA layer: it ships guides, templates, a skill and a
script, no library code. Declare it as a dev dependency and instantiate it
once:

```bash
dart pub add dev:dna_readme     # Dart projects
pnpm add -D @ggdna/dna-readme   # TypeScript projects
helix init
```

Then type `/readme` in Claude Code, or check the README yourself:

```bash
node scripts/check-readme.js
```

A README that follows the guide prints:

```text
✓ README matches the guide
```
