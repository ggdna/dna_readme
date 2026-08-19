---
name: readme
description: Checks the README against the README guide and template and fixes what is missing. Use when the user says "/readme" or asks to write or review the README.
---

<!--
@license
Copyright (c) ggsuite

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# Readme

Read `doc/guides/readme-guide.md` and `doc/templates/readme-template.md`
and follow them.

## 1. Compare against the template

Check the README for the sections the template defines, in that order.

Report missing sections, sections in the wrong place, and sections that
carry content the guide places elsewhere.

## 2. Check the content

Verify that every code example runs unchanged and matches `example/`.

Verify that "Open Bugs" lists every known open bug.

Verify that the documentation section links instead of duplicating.

## 3. Fix

Write the corrections, then show the diff before committing.
