# dna_readme

English | [Deutsch](README.de.md)

The DNA layer that tells a repo how to write and check its README.

## Motivation

A reader decides on the first screen of a README whether a package fits.
Without shared rules every repo writes it differently: the reason a repo
exists goes missing, examples drift away from the code, badges and links
break. This layer gives every repo the same structure, modeled on how
large open-source projects write their READMEs, and a script that finds
what drifted.

## Usage

Declare it as a dev-dependency and initialize once:

```bash
pnpm add -D @ggdna/dna-readme   # TypeScript projects
dart pub add dev:dna_readme     # Dart projects
helix init
```

The placed test instantiates and verifies the DNA on every test run.

## Guides

- `dna/doc/guides/readme-guide.md` — how to write the README of a package
  or an app, and the style, language and check rules every README follows
- `dna/doc/guides/readme-dna-guide.md` — the sections of a DNA repo's
  README, which lists what the layer ships

## Templates

- `dna/doc/templates/readme-template.md` — the README of a package or an
  app
- `dna/doc/templates/readme-dna-template.md` — the README of a DNA layer

## Skills

- `/readme` — runs the check, picks the matching guide and fixes what the
  README is missing

## Scripts

- `dna/scripts/check-readme.js` — checks `README.md` and `README.de.md`
  against the guides; both guides and `/readme` call it

## Scope

Translating documentation in general belongs to `dna_translate`, running
the check in CI to the pipeline of `dna_github`.

## Layers

Orthogonal: this layer carries only its own topic and is combined with
other layers by the consuming repo.

## Variables

- `dnaCopyrightHolder` — the name in the license header of every file
- `dnaGitOrg`, `dnaGitOrgUrl` — the organization the badge URL points at.
  The URL is set on its own: derived from `dnaGitOrg`, the reference
  would re-case the name (`my-org` → `myOrg`).

They name the organization, so they are never inherited: every layer or
project listing this one sets them in its own `dna/_vars.json`.
`helix init` and `helix add` ask for the missing ones.

## Development

The `dna/` folder is hand-authored source and is never generated. The repo
instantiates its own DNA — run `dart test` after changes; commit first, a
file the DNA would overwrite must not carry uncommitted work.

## License

MIT — see [LICENSE](LICENSE).
