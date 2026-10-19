# dna_readme

English | [Deutsch](README.de.md)

Gives a repo the rules, templates and a check to write a good README.

## Motivation

READMEs are written once and then left behind. The first screen does not
say what the package does, the motivation is missing, examples stop
running, links break and the German translation drifts away from the
English one. DNA repos have a problem of their own: their README rarely
says which files a repo gets by adding the layer, which variables it has
to set and which layers it builds on.

This layer gives every repo the same rules for its README and a script
that finds what a reviewer would otherwise have to spot by hand.

## Usage

Declare it as a dev-dependency and initialize once:

```bash
pnpm add -D @ggdna/dna-readme   # TypeScript projects
dart pub add dev:dna_readme     # Dart projects
helix init
```

`helix init` places a test that instantiates and verifies the DNA on every
test run. It copies the guides and templates in `doc/`, the skill in
`.claude/skills/readme/` and the check script in `scripts/`.

Type `/readme` in Claude Code to have the README written or revised, or
run the check yourself. The script needs Node.js 22 or newer, in Dart
repos as well:

```bash
node scripts/check-readme.js
```

A README that follows the guide prints:

```text
✓ README matches the guide
```

Otherwise the script prints one line per finding and exits with code 1.

## Guides

- `dna/doc/guides/readme-guide.md` — how to write the README of a package
  or an app: the first screen, motivation, install and usage, limits,
  links, badges, Markdown style and the German translation
- `dna/doc/guides/readme-dna-guide.md` — what the README of a DNA repo
  adds: what the layer ships, its scope, its parent layers and its
  variables

## Templates

- `dna/doc/templates/readme-template.md` — the README of a package or an
  app
- `dna/doc/templates/readme-dna-template.md` — the README of a DNA repo

## Skills

- `/readme` — picks the guide that fits the repo, runs the check script,
  checks what the script cannot and writes the fixes into `README.md` and
  `README.de.md`; follows both guides

## Scripts

- `dna/scripts/check-readme.js` — reports missing or misplaced sections,
  leftover placeholders, broken links and badges, an opening sentence
  that differs from the `description`, a German README that drifted, and
  in a DNA repo every `dna/` file, variable and parent layer the README
  does not mention; both guides and the `/readme` skill call it

## Scope

The layer only sets the rules for the README and checks them. It does not
write the README on its own, and it leaves the CI workflow the badge
points to, the `LICENSE` file, the `example/` code and a translation
guide such as `doc/guides/translate-guide.md` to the repo and to other
layers.

## Layers

The layer is orthogonal: `dna/_dna.json` lists no parent layers. It
carries only its own topic and is combined with language layers such as
dna_dart and dna-ts by the consuming repo.

## Variables

The layer never inherits these variables, because they name the
organization. Every repo that lists this layer sets all three in its own
`dna/_vars.json`.

- `dnaCopyrightHolder` — the holder named in the copyright header of
  every placed file
- `dnaGitOrg` — the name of the GitHub organization that hosts the repo
- `dnaGitOrgUrl` — the URL of that organization, used for the CI badge
  in the templates; set it explicitly, because deriving it from
  `dnaGitOrg` changes the case of the name and the badge points nowhere

## Development

The `dna/` folder is hand-authored source and is never generated. The repo
instantiates its own DNA — run `dart test` after changes; commit first, a
file the DNA would overwrite must not carry uncommitted work.

Edit the files below `dna/`, not their copies in `doc/`, `.claude/` and
`scripts/`, which the test overwrites. `test/check_readme_test.dart` runs
the check script against the sample repos in
`test/sample_folder/check_readme/` and against this README.

## License

MIT — see [LICENSE](LICENSE).
