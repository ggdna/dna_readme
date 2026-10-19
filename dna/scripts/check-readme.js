#!/usr/bin/env node

/**
 * @license
 * Copyright (c) dnaCopyrightHolder
 *
 * Use of this source code is governed by terms that can be
 * found in the LICENSE file in the root of this package.
 */

// Checks README.md and README.de.md against the README guides and prints
// every finding. Usage: node scripts/check-readme.js [repo directory]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// .............................................................................
// The sections of the templates, in their order

const packageSections = [
  { name: 'Motivation', required: true },
  { name: 'Installation', required: true },
  { name: 'Usage', required: true },
  { name: 'Limitations' },
  { name: 'Documentation' },
  { name: 'How it works' },
  { name: 'Status' },
  { name: 'Contributing' },
  { name: 'License', required: true },
];

const dnaSections = [
  { name: 'Motivation', required: true },
  { name: 'Usage', required: true },
  { name: 'Guides' },
  { name: 'Templates' },
  { name: 'Skills' },
  { name: 'Scripts' },
  { name: 'Configuration' },
  { name: 'Scope' },
  { name: 'Layers', required: true },
  { name: 'Variables' },
  { name: 'Development', required: true },
  { name: 'License', required: true },
];

// .............................................................................
// Reading files

const readText = (file) =>
  fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

// Strips comments and trailing commas, so JSONC parses as JSON.
export const parseJsonc = (text) => {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === '\\') out += text[++i] ?? '';
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      if (i < 0) break;
      i++;
    } else {
      out += c;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
};

// Reads a top-level scalar of pubspec.yaml, also when it spans lines.
export const yamlScalar = (text, key) => {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (start < 0) return null;

  const parts = [lines[start].slice(key.length + 1).trim()];
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break;
    parts.push(line.trim());
  }

  let value = parts.join(' ').trim();
  if (/^[>|][+-]?/.test(value)) value = value.replace(/^[>|][+-]?\s*/, '');
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    value = value.slice(1, -1);
    if (quote === '"') value = value.replace(/\\"/g, '"');
  }
  return value;
};

const readPackage = (repoDir) => {
  const pubspec = readText(path.join(repoDir, 'pubspec.yaml'));
  if (pubspec) {
    return {
      name: yamlScalar(pubspec, 'name'),
      description: yamlScalar(pubspec, 'description'),
    };
  }
  const packageJson = readText(path.join(repoDir, 'package.json'));
  if (packageJson) {
    const json = JSON.parse(packageJson);
    return {
      name: (json.name ?? '').replace(/^@[^/]+\//, ''),
      description: json.description ?? null,
    };
  }
  return { name: path.basename(repoDir), description: null };
};

const listFiles = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full, base);
    return [path.relative(base, full).split(path.sep).join('/')];
  });

// .............................................................................
// Parsing Markdown

// Splits Markdown into prose and code. Prose keeps the line structure,
// with code blocks, inline code and HTML comments blanked out.
export const parseMarkdown = (text) => {
  const codeBlocks = [];
  const inlineCode = [];
  const proseLines = [];
  let fence = null;
  let block = null;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})\s*([\w-]*)/);
    if (fence) {
      if (match && match[1][0] === fence[0] && match[1].length >= fence.length) {
        codeBlocks.push(block);
        fence = null;
      } else {
        block.code.push(line);
      }
      proseLines.push('');
    } else if (match) {
      fence = match[1];
      block = { language: match[2], code: [] };
      proseLines.push('');
    } else {
      proseLines.push(line);
    }
  }

  let prose = proseLines
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''));
  prose = prose.replace(/(`+)([\s\S]*?)\1/g, (_, ticks, code) => {
    inlineCode.push(code);
    return '';
  });

  const headings = (level) =>
    prose
      .split('\n')
      .map((l) => l.match(new RegExp(`^#{${level}}\\s+(.+?)\\s*#*\\s*$`)))
      .filter((m) => m && !m[0].startsWith('#'.repeat(level + 1)))
      .map((m) => m[1]);

  return {
    prose,
    inlineCode,
    codeBlocks: codeBlocks.map((b) => ({ ...b, code: b.code.join('\n') })),
    h1: headings(1),
    h2: headings(2),
  };
};

const normalize = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
    .toLowerCase();

// The first paragraph below the title that is neither a badge nor the
// language switcher.
const introOf = (prose) => {
  const paragraphs = prose.split(/\n\s*\n/).map((p) => p.trim());
  const title = paragraphs.findIndex((p) => /^#\s/.test(p));
  return (
    paragraphs
      .slice(title + 1)
      .find(
        (p) =>
          p &&
          !p.startsWith('#') &&
          !/^(\[!\[|!\[|<)/.test(p) &&
          !/\[(Deutsch|English)\]\(README/.test(p),
      ) ?? null
  );
};

// .............................................................................
// The checks

const checkSections = (md, sections, findings) => {
  const known = sections.map((s) => s.name.toLowerCase());
  const present = md.h2.map((h) => h.toLowerCase());

  for (const section of sections) {
    if (section.required && !present.includes(section.name.toLowerCase())) {
      findings.push(`Section "## ${section.name}" is missing`);
    }
  }

  const order = present.filter((h) => known.includes(h));
  for (let i = 1; i < order.length; i++) {
    if (known.indexOf(order[i]) < known.indexOf(order[i - 1])) {
      const name = sections[known.indexOf(order[i])].name;
      const before = sections[known.indexOf(order[i - 1])].name;
      findings.push(`Section "## ${name}" belongs before "## ${before}"`);
    }
  }
};

// A placeholder is a prose sentence in angle brackets, or a template line
// with a placeholder that was copied unchanged.
const checkPlaceholders = (md, text, template, findings) => {
  const found = new Set();
  for (const m of md.prose.matchAll(/<(?!https?:)[A-Z][^<>]*>/g)) {
    found.add(m[0].replace(/\s+/g, ' '));
  }
  const templateLines = new Set(
    (template ?? '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /<[\w-]+>/.test(l) && !l.startsWith('<!--')),
  );
  for (const line of text.split(/\r?\n/).map((l) => l.trim())) {
    const known = [...found].some((p) => line.includes(p));
    if (templateLines.has(line) && !known) found.add(line);
  }
  for (const block of md.codeBlocks) {
    if (block.language !== 'text' && block.language !== '') continue;
    for (const m of block.code.matchAll(/<[A-Z][^<>]*\s[^<>]*>/g)) {
      found.add(m[0].replace(/\s+/g, ' '));
    }
  }
  for (const placeholder of found) {
    const short =
      placeholder.length > 60 ? `${placeholder.slice(0, 57)}...` : placeholder;
    findings.push(`Placeholder ${short} is left`);
  }
};

const checkLinks = (md, repoDir, packageName, findings) => {
  const targets = [
    ...[...md.prose.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)],
    ...[...md.prose.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm)],
    ...[...md.prose.matchAll(/\b(?:src|href|srcset)="([^"\s]+)/g)],
  ].map((m) => m[1]);

  for (const target of new Set(targets)) {
    if (target.startsWith('http://')) {
      findings.push(`Link ${target} uses http, use https`);
      continue;
    }

    const badge = target.match(
      /github\.com\/[^/]+\/([^/]+)\/actions\/workflows\/([^/?#]+)/,
    );
    if (badge && (badge[1] === packageName || badge[1] === path.basename(repoDir))) {
      const workflow = path.join(repoDir, '.github', 'workflows', badge[2]);
      if (!fs.existsSync(workflow)) {
        findings.push(
          `Badge points to .github/workflows/${badge[2]}, which does not exist`,
        );
      }
      continue;
    }

    if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) continue;
    const file = decodeURI(target.replace(/[#?].*$/, ''));
    if (file && !fs.existsSync(path.resolve(repoDir, file))) {
      findings.push(`Link ${target} points to a file that does not exist`);
    }
  }
};

const checkIntro = (md, description, findings) => {
  const intro = introOf(md.prose);
  if (!intro) {
    findings.push('The sentence below the title saying what it does is missing');
    return;
  }
  if (description && !normalize(intro).includes(normalize(description))) {
    findings.push(
      `The sentence below the title differs from the description "${description}"`,
    );
  }
};

const checkGerman = (repoDir, md, findings) => {
  const text = readText(path.join(repoDir, 'README.de.md'));
  if (!/\[Deutsch\]\(\.?\/?README\.de\.md\)/.test(md.prose)) {
    findings.push('README.md: the language switcher to README.de.md is missing');
  }
  if (text === null) {
    findings.push('README.de.md is missing');
    return;
  }

  const de = parseMarkdown(text);
  if (!/\[English\]\(\.?\/?README\.md\)/.test(de.prose)) {
    findings.push('README.de.md: the language switcher to README.md is missing');
  }
  if (de.h2.length !== md.h2.length) {
    findings.push(
      `README.de.md has ${de.h2.length} sections, README.md has ${md.h2.length}`,
    );
  }

  const en = md.codeBlocks.map((b) => b.code.trim());
  const ge = de.codeBlocks.map((b) => b.code.trim());
  if (en.length !== ge.length) {
    findings.push(
      `README.de.md has ${ge.length} code blocks, README.md has ${en.length}`,
    );
  } else {
    const index = en.findIndex((code, i) => code !== ge[i]);
    if (index >= 0) {
      findings.push(
        `README.de.md: code block ${index + 1} differs from README.md`,
      );
    }
  }
};

// Whether text names a path or name on its own, not as part of a longer one
const mentions = (text, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w./-])${escaped}(?![\\w-]|\\.\\w|/\\w)`).test(
    text,
  );
};

const checkDna = (repoDir, text, findings) => {
  const dnaDir = path.join(repoDir, 'dna');

  // Every file the layer ships is mentioned
  const files = listFiles(dnaDir).filter((f) => !/^_[^/]*\.json$/.test(f));
  for (const file of files) {
    const skill = file.match(/^dot-claude\/skills\/([^/]+)\//);
    if (skill) {
      const command = new RegExp(`(^|[\\s\`(])/${skill[1]}\\b`, 'm');
      if (!command.test(text)) {
        findings.push(`Skill /${skill[1]} is not mentioned`);
      }
      continue;
    }
    const paths = file
      .split('/')
      .map((_, i, parts) => `dna/${parts.slice(0, i + 1).join('/')}`)
      .map((p, i, all) => (i < all.length - 1 ? `${p}/` : p));
    if (!paths.some((p) => mentions(text, p))) {
      findings.push(`dna/${file} is not mentioned`);
    }
  }

  // Every mentioned file exists
  for (const m of new Set(text.match(/(?<![\w./-])dna\/[\w./-]*[\w/]/g) ?? [])) {
    if (!fs.existsSync(path.join(repoDir, m))) {
      findings.push(`${m} is mentioned but does not exist`);
    }
  }

  // Every variable is documented
  const vars = readText(path.join(dnaDir, '_vars.json'));
  for (const key of Object.keys(vars ? parseJsonc(vars) : {})) {
    if (!text.includes(`\`${key}\``)) {
      findings.push(`Variable ${key} is not documented`);
    }
  }

  // Every parent layer is named, or the layer says it is orthogonal
  const config = readText(path.join(dnaDir, '_dna.json'));
  const layers = config ? (parseJsonc(config).layers ?? []) : [];
  for (const layer of layers) {
    const name =
      typeof layer === 'string' ? layer : (layer.package ?? layer.name);
    const bare = (name ?? '').replace(/^@[^/]+\//, '');
    const variants = [bare, bare.replace(/-/g, '_'), bare.replace(/_/g, '-')];
    if (name && !variants.some((v) => mentions(text, v))) {
      findings.push(`Parent layer ${name} is not named`);
    }
  }
  if (layers.length === 0 && !/orthogonal/i.test(text)) {
    findings.push('The README does not say that the layer is orthogonal');
  }
};

// .............................................................................

export const isDnaRepo = (repoDir, packageName) =>
  /^dna[_-]/.test(packageName ?? '') ||
  fs.existsSync(path.join(repoDir, 'dna', '_vars.json'));

export const checkReadme = (repoDir) => {
  const text = readText(path.join(repoDir, 'README.md'));
  if (text === null) return ['README.md is missing'];

  const findings = [];
  const pkg = readPackage(repoDir);
  const isDna = isDnaRepo(repoDir, pkg.name);
  const md = parseMarkdown(text);

  if (md.h1.length !== 1) {
    findings.push(`README.md has ${md.h1.length} titles, it needs one`);
  }
  checkSections(md, isDna ? dnaSections : packageSections, findings);
  const template = readText(
    path.join(
      repoDir,
      'doc',
      'templates',
      isDna ? 'readme-dna-template.md' : 'readme-template.md',
    ),
  );
  checkPlaceholders(md, text, template, findings);
  checkLinks(md, repoDir, pkg.name, findings);
  checkIntro(md, pkg.description, findings);
  checkGerman(repoDir, md, findings);
  if (isDna) checkDna(repoDir, text, findings);

  return findings;
};

// .............................................................................

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const repoDir = path.resolve(process.argv[2] ?? '.');
  const findings = checkReadme(repoDir);
  if (findings.length === 0) {
    console.log('✓ README matches the guide');
  } else {
    for (const finding of findings) console.log(`✗ ${finding}`);
    process.exit(1);
  }
}
