# dna_readme

The DNA layer that tells a repo how to write its README.

## Guides

- `dna/doc/guides/readme-guide.md` — how to write and maintain the README
  of an ordinary repo
- `dna/doc/guides/readme-dna-guide.md` — the same for a DNA repo, where
  the README lists what the layer ships

## Templates

- `dna/doc/templates/readme-template.md` — the structure every README
  follows
- `dna/doc/templates/readme-dna-template.md` — the structure a DNA README
  follows

## Skills

- `/readme` — picks the matching guide, reports what the README is
  missing and fixes it

## Layers

Orthogonal: this layer carries only its own topic and is combined with
other layers by the consuming repo.

## Variables

- `dnaCopyrightHolder` — the name in the license header of every file
- `dnaGitOrg`, `dnaGitOrgUrl` — the organization the badge URL points at

## Usage

Declare it as a dev-dependency and initialize once:

```bash
pnpm add -D @ggdna/dna-readme   # TypeScript projects
dart pub add dev:dna_readme     # Dart projects
helix init
```

The placed test instantiates and verifies the DNA on every test run.

## Development

The `dna/` folder is hand-authored source and is never generated. The repo
instantiates its own DNA — run `dart test` after changes; commit first, a
file the DNA would overwrite must not carry uncommitted work.
