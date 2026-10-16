import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mdi from '@mdi/js'
import { MIXTAPE_ICON_PATHS } from '@pedrolucaslopes/mixtape-ui/icons'

const root = fileURLToPath(new URL('..', import.meta.url))
const check = process.argv.includes('--check')
const NAME = /\bmdi-[a-z0-9]+(?:-[a-z0-9]+)*\b/g
const output = join(root, 'src', 'plugins', 'icons.generated.ts')

function walk (path) {
  return statSync(path).isDirectory()
    ? readdirSync(path).flatMap(entry => walk(join(path, entry)))
    : [path]
}

const files = walk(join(root, 'src'))
  .filter(file => ['.vue', '.ts'].includes(extname(file)) && !file.endsWith('.generated.ts'))

const used = new Set()
for (const file of files) {
  for (const match of readFileSync(file, 'utf8').matchAll(NAME)) {
    used.add(match[0])
  }
}

function exportName (name) {
  return `mdi${name
    .slice(4)
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`
}

const names = [...used].filter(name => !Object.hasOwn(MIXTAPE_ICON_PATHS, name)).toSorted()
const unknown = names.filter(name => typeof mdi[exportName(name)] !== 'string')
if (unknown.length > 0) {
  throw new Error(`@mdi/js has no icon for: ${unknown.join(', ')}`)
}

const version = JSON.parse(readFileSync(join(root, 'node_modules', '@mdi', 'js', 'package.json'), 'utf8')).version
const content = [
  'export const APP_ICON_PATHS: Readonly<Record<string, string>> = {',
  ...names.map(name => `  '${name}': '${mdi[exportName(name)]}',`),
  '}',
  '',
].join('\n')

const current = existsSync(output) ? readFileSync(output, 'utf8') : null
const summary = `${names.length} in the app, ${used.size - names.length} from the library (@mdi/js ${version})`

if (check) {
  if (current === content) {
    console.log(`icons checked: ${summary}`)
  } else {
    console.error(`${relative(root, output)} is out of date: run npm run sync:icons`)
    process.exitCode = 1
  }
} else {
  if (current !== content) {
    writeFileSync(output, content, 'utf8')
  }
  console.log(`icons written: ${summary}`)
}
