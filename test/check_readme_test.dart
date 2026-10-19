// @license
// Copyright (c) ggsuite
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';

// Runs dna/scripts/check-readme.js with node against the sample repos in
// test/sample_folder/check_readme and against this repo itself.

const _samples = 'test/sample_folder/check_readme';

Future<(int, List<String>)> _check(String repoDir) async {
  final result = await Process.run(
    'node',
    ['dna/scripts/check-readme.js', repoDir],
    stdoutEncoding: utf8,
  );
  final lines = (result.stdout as String)
      .split('\n')
      .map((l) => l.trim())
      .where((l) => l.isNotEmpty)
      .toList();
  return (result.exitCode, lines);
}

void main() {
  group('check-readme.js', () {
    group('passes', () {
      for (final repo in ['$_samples/package_good', '$_samples/dna_good', '.']) {
        test(repo, () async {
          final (exitCode, lines) = await _check(repo);
          expect(lines, ['✓ README matches the guide']);
          expect(exitCode, 0);
        });
      }
    });

    test('reports a package README that breaks the guide', () async {
      final (exitCode, lines) = await _check('$_samples/package_bad');
      expect(lines, [
        '✗ The title "<PackageName>" is not the package name sample_package',
        '✗ The sentence below the title differs from the description '
            '"Formats sample values for the tests of this repo."',
        '✗ Section "## Motivation" is missing',
        '✗ Section "## License" is missing',
        '✗ Section "## Installation" belongs before "## Usage"',
        '✗ Placeholder <PackageName> is left',
        '✗ Placeholder <what it does, in one line> is left',
        '✗ Placeholder <package> is left',
        '✗ Link text "here" does not say where it leads',
        '✗ Link doc/guides/missing-guide.md points to a file that does not '
            'exist',
        '✗ Link http://example.com uses http, use https',
        '✗ Badge points to the organization other-org, the repository is in '
            'sample-org',
        '✗ Badge points to .github/workflows/check.yaml, which does not exist',
        '✗ 1 code block(s) without a language',
        '✗ README.md: the language switcher to README.de.md is missing',
        '✗ README.de.md is missing',
      ]);
      expect(exitCode, 1);
    });

    test('reports a German README that drifted', () async {
      final (exitCode, lines) = await _check('$_samples/package_german_drift');
      expect(lines, [
        '✗ README.de.md: the language switcher to README.md is missing',
        '✗ README.de.md: 4 sections, README.md has 6',
        '✗ README.de.md: code block 2 differs from README.md',
      ]);
      expect(exitCode, 1);
    });

    test('reports a DNA README that misses what the layer ships', () async {
      final (exitCode, lines) = await _check('$_samples/dna_bad');
      expect(lines, [
        '✗ Section "## Motivation" is missing',
        '✗ Section "## Development" is missing',
        '✗ Section "## License" is missing',
        '✗ Section "## Usage" belongs before "## Guides"',
        '✗ README.md: the language switcher to README.de.md is missing',
        '✗ README.de.md is missing',
        '✗ dna/doc/guides/other-guide.md is not mentioned',
        '✗ dna/dot-prettierrc is not mentioned',
        '✗ Skill /sample is not mentioned',
        '✗ dna/doc/guides/removed-guide.md is mentioned but does not exist',
        '✗ Variable dnaSampleOrg is not documented',
        '✗ Parent layer @sample-org/dna-parent is not named',
      ]);
      expect(exitCode, 1);
    });

    test('reports broken input instead of crashing', () async {
      final dir = await Directory.systemTemp.createTemp('check_readme_');
      addTearDown(() => dir.delete(recursive: true));
      Directory('${dir.path}/dna/dot-claude/skills/c++').createSync(
        recursive: true,
      );
      File('${dir.path}/dna/dot-claude/skills/c++/SKILL.md')
          .writeAsStringSync('# C++');
      File('${dir.path}/dna/_dna.json').writeAsStringSync('{ "layers": [');
      File('${dir.path}/pubspec.yaml').writeAsStringSync('name: dna_broken');
      File('${dir.path}/README.md').writeAsStringSync(
        '# dna_broken\n\nSee [the table](100%.md).\n\n'
        'Run `/c++` to start.\n',
      );

      final (exitCode, lines) = await _check(dir.path);
      expect(lines, contains('✗ Link 100%.md is not a valid URI'));
      expect(lines, contains('✗ dna/_dna.json is not valid JSON'));
      expect(lines, isNot(contains('✗ Skill /c++ is not mentioned')));
      expect(exitCode, 1);
    });

    test('reports a missing README', () async {
      final dir = await Directory.systemTemp.createTemp('check_readme_');
      addTearDown(() => dir.delete(recursive: true));
      final (exitCode, lines) = await _check(dir.path);
      expect(lines, ['✗ README.md is missing']);
      expect(exitCode, 1);
    });
  });
}
