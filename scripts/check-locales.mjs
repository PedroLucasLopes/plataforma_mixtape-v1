import { readdirSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { extname, join, relative } from 'node:path'

const args = process.argv.slice(2)
const directory = args.find(arg => !arg.startsWith('--'))
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
const referenceFile = option('reference') ?? 'pt-BR.json'
const sources = option('sources')

if (!directory) {
  throw new Error('Usage: node scripts/check-locales.mjs <locales dir> [--reference=pt-BR.json] [--sources=<code dir>]')
}

function flatten (tree, prefix = '') {
  return Object.entries(tree).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]],
  )
}

const files = readdirSync(directory).filter(file => file.endsWith('.json')).toSorted()

if (!files.includes(referenceFile)) {
  throw new Error(`${referenceFile} not found in ${directory}: it is the reference for the other languages.`)
}

const load = file => new Map(flatten(JSON.parse(readFileSync(join(directory, file), 'utf8'))))
const reference = load(referenceFile)
const problems = []
const warnings = []

const withoutLiterals = text => text.replace(/\{\s*'[^']*'\s*\}/g, '')
function parameters (text) {
  return [...new Set([...withoutLiterals(text).matchAll(/\{\s*(\w+)\s*\}/g)].map(match => match[1]))].toSorted().join(', ')
}
const forms = text => withoutLiterals(text).split('|').length

const require = createRequire(import.meta.url)
let compile = null

try {
  ({ baseCompile: compile } = require('@intlify/message-compiler'))
} catch {
  warnings.push('@intlify/message-compiler not found: message syntax was not compiled.')
}

function syntaxErrors (text) {
  if (!compile) {
    return []
  }
  const errors = []
  compile(text, { onError: error => errors.push(error.message) })
  return errors
}

for (const file of files) {
  const messages = file === referenceFile ? reference : load(file)

  for (const [key, text] of messages) {
    if (typeof text !== 'string' || text.trim() === '') {
      problems.push(`${file}: "${key}" is empty or not a string`)
      continue
    }

    for (const error of syntaxErrors(text)) {
      problems.push(`${file}: "${key}" does not compile in vue-i18n (${error})`)
    }

    if (file === referenceFile) {
      continue
    }

    const original = reference.get(key)

    if (original === undefined) {
      problems.push(`${file}: "${key}" does not exist in ${referenceFile}`)
      continue
    }

    if (parameters(text) !== parameters(original)) {
      problems.push(`${file}: "${key}" uses {${parameters(text)}}, the reference uses {${parameters(original)}}`)
    }

    if (forms(text) !== forms(original)) {
      problems.push(`${file}: "${key}" has ${forms(text)} plural form(s), the reference has ${forms(original)}`)
    }
  }

  if (file !== referenceFile) {
    for (const key of reference.keys()) {
      if (!messages.has(key)) {
        problems.push(`${file}: missing "${key}"`)
      }
    }
  }
}

if (sources) {
  const walk = path =>
    statSync(path).isDirectory() ? readdirSync(path).flatMap(entry => walk(join(path, entry))) : [path]

  const code = walk(sources).filter(
    file => ['.vue', '.ts'].includes(extname(file)) && !file.endsWith('.d.ts') && !file.includes('.stories.') && !file.includes(`${join('src', 'mocks')}`),
  )
  const namespaces = new Set([...reference.keys()].map(key => key.split('.', 1)[0]))
  const groups = new Set(
    [...reference.keys()].flatMap(key =>
      key
        .split('.')
        .slice(0, -1)
        .map((_, index, parts) => parts.slice(0, index + 1).join('.')),
    ),
  )
  const used = new Set()
  const prefixes = new Set()

  for (const file of code) {
    const text = readFileSync(file, 'utf8')

    for (const match of text.matchAll(/(['`])([a-z][A-Za-z0-9]*(?:\.\w+)+)\1/g)) {
      const key = match[2]
      if (!namespaces.has(key.split('.', 1)[0])) {
        continue
      }
      if (reference.has(key)) {
        used.add(key)
      } else if (groups.has(key)) {
        prefixes.add(`${key}.`)
      } else {
        problems.push(`${relative(process.cwd(), file)}: "${key}" does not exist in ${referenceFile}`)
      }
    }

    for (const match of text.matchAll(/`([a-z][A-Za-z0-9]*(?:\.\w+)*\.)\w*\$\{/g)) {
      prefixes.add(match[1])
    }

    for (const match of text.matchAll(/keypath="([a-z][A-Za-z0-9]*(?:\.\w+)+)"/g)) {
      if (reference.has(match[1])) {
        used.add(match[1])
      } else {
        problems.push(`${relative(process.cwd(), file)}: "${match[1]}" does not exist in ${referenceFile}`)
      }
    }
  }

  for (const key of reference.keys()) {
    if (!used.has(key) && ![...prefixes].some(prefix => key.startsWith(prefix))) {
      warnings.push(`"${key}" is not used in the code`)
    }
  }
}

for (const warning of warnings) {
  console.warn(`warning: ${warning}`)
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(problem)
  }
  console.error(`\n${problems.length} translation problem(s).`)
  process.exitCode = 1
} else {
  console.log(`Translations checked: ${files.join(', ')}, ${reference.size} keys each.`)
}
