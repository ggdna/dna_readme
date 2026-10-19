# dna_readme

[English](README.md) | Deutsch

Gibt einem Repo die Regeln, Templates und eine Prüfung für eine gute README.

## Motivation

READMEs werden einmal geschrieben und dann vergessen. Der erste
Bildschirm sagt nicht, was das Paket tut, die Motivation fehlt, Beispiele
laufen nicht mehr, Links brechen und die deutsche Übersetzung entfernt
sich von der englischen. DNA-Repos haben ein eigenes Problem: Ihre README
sagt selten, welche Dateien ein Repo durch die Schicht bekommt, welche
Variablen es setzen muss und auf welchen Schichten sie aufbaut.

Diese Schicht gibt jedem Repo dieselben Regeln für seine README und ein
Skript, das findet, was ein Reviewer sonst von Hand entdecken müsste.

## Verwendung

Als Dev-Dependency eintragen und einmal initialisieren:

```bash
pnpm add -D @ggdna/dna-readme   # TypeScript projects
dart pub add dev:dna_readme     # Dart projects
helix init
```

`helix init` legt einen Test ab, der die DNA bei jedem Testlauf
instanziiert und prüft. Er legt die Guides und Templates in `doc/` ab, den Skill in
`.claude/skills/readme/` und das Prüfskript in `scripts/`.

Tippe `/readme` in Claude Code, um die README schreiben oder überarbeiten
zu lassen, oder starte die Prüfung selbst. Das Skript braucht Node.js 22
oder neuer, auch in Dart-Repos:

```bash
node scripts/check-readme.js
```

Eine README, die dem Guide folgt, gibt aus:

```text
✓ README matches the guide
```

Sonst gibt das Skript eine Zeile pro Befund aus und endet mit Code 1.

## Guides

- `dna/doc/guides/readme-guide.md` — wie man die README eines Pakets oder
  einer App schreibt: erster Bildschirm, Motivation, Installation und
  Verwendung, Grenzen, Links, Badges, Markdown-Stil und die deutsche
  Übersetzung
- `dna/doc/guides/readme-dna-guide.md` — was die README eines DNA-Repos
  ergänzt: was die Schicht mitliefert, ihren Umfang, ihre Eltern-Schichten
  und ihre Variablen

## Templates

- `dna/doc/templates/readme-template.md` — die README eines Pakets oder
  einer App
- `dna/doc/templates/readme-dna-template.md` — die README eines DNA-Repos

## Skills

- `/readme` — wählt den passenden Guide, startet das Prüfskript, prüft,
  was das Skript nicht kann, und schreibt die Korrekturen in `README.md`
  und `README.de.md`; folgt beiden Guides

## Skripte

- `dna/scripts/check-readme.js` — meldet fehlende oder falsch platzierte
  Abschnitte, übrig gebliebene Platzhalter, kaputte Links und Badges,
  einen Eröffnungssatz, der von der `description` abweicht, eine
  abgedriftete deutsche README und in einem DNA-Repo jede `dna/`-Datei,
  Variable und Eltern-Schicht, die die README nicht nennt; beide Guides
  und der Skill `/readme` rufen es auf

## Umfang

Die Schicht legt nur die Regeln für die README fest und prüft sie. Sie
schreibt die README nicht von selbst und überlässt den CI-Workflow, auf
den das Badge zeigt, die Datei `LICENSE`, den Code in `example/` und
einen Übersetzungs-Guide wie `doc/guides/translate-guide.md` dem Repo und
anderen Schichten.

## Schichten

Die Schicht ist orthogonal: `dna/_dna.json` nennt keine Eltern-Schichten.
Sie trägt nur ihr eigenes Thema und wird vom nutzenden Repo mit
Sprach-Schichten wie dna_dart und dna-ts kombiniert.

## Variablen

Die Schicht vererbt diese Variablen nie, weil sie die Organisation
nennen. Jedes Repo, das diese Schicht einbindet, setzt alle drei in
seiner eigenen `dna/_vars.json`.

- `dnaCopyrightHolder` — der Rechteinhaber im Copyright-Kopf jeder
  abgelegten Datei
- `dnaGitOrg` — der Name der GitHub-Organisation, die das Repo hostet
- `dnaGitOrgUrl` — die URL dieser Organisation, genutzt für das CI-Badge
  in den Templates; explizit setzen, weil die Ableitung aus `dnaGitOrg`
  die Schreibweise des Namens ändert und das Badge ins Leere zeigt

## Entwicklung

Der Ordner `dna/` ist handgeschriebene Quelle und wird nie generiert. Das
Repo instanziiert seine eigene DNA — nach Änderungen `dart test` laufen
lassen; vorher committen, denn eine Datei, die die DNA überschreiben
würde, darf keine uncommittete Arbeit enthalten.

Bearbeite die Dateien unter `dna/`, nicht ihre Kopien in `doc/`,
`.claude/` und `scripts/`, die der Test überschreibt.
`test/check_readme_test.dart` startet das Prüfskript gegen die
Beispiel-Repos in `test/sample_folder/check_readme/` und gegen diese
README.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
