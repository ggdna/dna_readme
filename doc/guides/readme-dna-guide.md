<!--
@license
Copyright (c) ggsuite

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# README DNA Guide

Follow this guide for the README of a DNA repo — a repo that ships a
hand-authored `dna/` folder. Its reader does not call an API: they want to
know what their repo gets by adding the layer. The rules on style,
languages and checks of the [README Guide](./readme-guide.md) apply here
as well.

## Copy the template

- Copy `doc/templates/readme-dna-template.md` to `README.md`, or revise
  an existing README against it
- Drop every section this layer has nothing for
- Write `README.md` in English and `README.de.md` in German, as the
  README Guide says

## Say what the layer does

- Open with one sentence: what a repo gets by adding this layer
- Name the topic it owns, not the machinery behind it
- Write the motivation: which problem in the consuming repos the layer
  solves
- Show the usage right after the motivation, a reader wants to try it

## List what the layer ships

- Give guides, templates, skills, scripts and configuration their own
  section
- Name each file with its path below `dna/` and one line on its purpose
- Name a skill by the command a user types, e.g. `/translate`
- Say which guide calls a script

## Name its scope

- Name what it deliberately leaves to other layers

## Name the layers it builds on

- List the parent layers from `dna/_dna.json`, each linked to its repo
- Say what each parent contributes, not just its name
- State that the layer is orthogonal when it has no parents
- Name the sections it extends in a parent, and the tag it uses

## Document the variables

- List every variable of `dna/_vars.json`
- Give the meaning, not the default value
- Say which ones a consuming repo must set itself

## Keep it current

- Update the README in the same change that adds or removes a DNA file
- Run `node scripts/check-readme.js`; in a DNA repo it also reports every
  `dna/` file, variable and parent layer the README does not mention
