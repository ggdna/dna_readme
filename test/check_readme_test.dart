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
        '✗ Section "## Motivation" is missing',
        '✗ Section "## License" is missing',
        '✗ Section "## Installation" belongs before "## Usage"',
        '✗ Placeholder <PackageName> is left',
        '✗ Placeholder dart pub add <package> is left',
        '✗ Badge points to .github/workflows/check.yaml, which does not exist',
        '✗ Link doc/guides/missing-guide.md points to a file that does not '
            'exist',
        '✗ Link http://example.com uses http, use https',
        '✗ The sentence below the title differs from the description '
            '"Formats sample values for the tests of this repo."',
        '✗ README.md: the language switcher to README.de.md is missing',
        '✗ README.de.md is missing',
      ]);
      expect(exitCode, 1);
    });

    test('reports a German README that drifted', () async {
      final (exitCode, lines) = await _check('$_samples/package_german_drift');
      expect(lines, [
        '✗ README.de.md: the language switcher to README.md is missing',
        '✗ README.de.md has 4 sections, README.md has 6',
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
        '✗ Skill /sample is not mentioned',
        '✗ dna/doc/guides/removed-guide.md is mentioned but does not exist',
        '✗ Variable dnaSampleOrg is not documented',
        '✗ Parent layer @sample-org/dna-parent is not named',
      ]);
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
