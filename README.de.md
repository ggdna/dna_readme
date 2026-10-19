# dna_readme

[English](README.md) | Deutsch

Der DNA-Layer, der einem Repo sagt, wie es sein README schreibt und prüft.

## Motivation

Ob ein Paket passt, entscheidet ein Leser auf dem ersten Bildschirm des
READMEs. Ohne gemeinsame Regeln schreibt jedes Repo es anders: Der Grund,
warum es das Repo gibt, fehlt, Beispiele laufen dem Code davon, Badges und
Links gehen kaputt. Dieser Layer gibt jedem Repo dieselbe Struktur, nach
dem Vorbild großer Open-Source-Projekte, und ein Skript, das findet, was
auseinandergelaufen ist.

## Verwendung

Als Dev-Dependency eintragen und einmal initialisieren:

```bash
pnpm add -D @ggdna/dna-readme   # TypeScript projects
dart pub add dev:dna_readme     # Dart projects
helix init
```

Der abgelegte Test instanziiert und prüft die DNA bei jedem Testlauf.

## Guides

- `dna/doc/guides/readme-guide.md` — wie das README eines Pakets oder
  einer App entsteht, und die Regeln zu Stil, Sprachen und Prüfung, die
  für jedes README gelten
- `dna/doc/guides/readme-dna-guide.md` — die Abschnitte des READMEs eines
  DNA-Repos, das auflistet, was der Layer mitbringt

## Templates

- `dna/doc/templates/readme-template.md` — das README eines Pakets oder
  einer App
- `dna/doc/templates/readme-dna-template.md` — das README eines DNA-Layers

## Skills

- `/readme` — führt die Prüfung aus, wählt den passenden Guide und ergänzt,
  was dem README fehlt

## Skripte

- `dna/scripts/check-readme.js` — prüft `README.md` und `README.de.md`
  gegen die Guides; beide Guides und `/readme` rufen es auf

## Abgrenzung

Das Übersetzen von Dokumentation allgemein gehört zu `dna_translate`, die
Prüfung in der CI zur Pipeline von `dna_github`.

## Layer

Orthogonal: Dieser Layer trägt nur sein eigenes Thema und wird vom
nutzenden Repo mit anderen Layern kombiniert.

## Variablen

- `dnaCopyrightHolder` — der Name im Lizenz-Header jeder Datei
- `dnaGitOrg`, `dnaGitOrgUrl` — die Organisation, auf die die Badge-URL
  zeigt. Die URL wird eigens gesetzt: aus `dnaGitOrg` abgeleitet, würde die
  Referenz den Namen umschreiben (`my-org` → `myOrg`).

Sie benennen die Organisation und werden deshalb nie geerbt: Jeder Layer
und jedes Projekt, das diesen Layer einbindet, setzt sie in seiner eigenen
`dna/_vars.json`. `helix init` und `helix add` fragen nach den fehlenden.

## Entwicklung

Der Ordner `dna/` ist handgeschriebene Quelle und wird nie generiert. Das
Repo instanziiert seine eigene DNA — nach Änderungen `dart test` ausführen;
vorher committen, denn eine Datei, die die DNA überschreiben würde, darf
keine ungesicherte Arbeit enthalten.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
