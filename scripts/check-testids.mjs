import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { parse } from 'vue/compiler-sfc'

const args = process.argv.slice(2)
const scopes = args
  .filter(arg => arg.startsWith('--scope='))
  .map(arg => {
    const [path, prefix = '', affix = ''] = arg.slice('--scope='.length).split(',')
    return { path, prefix, affix }
  })

if (scopes.length === 0) {
  throw new Error('Usage: node scripts/check-testids.mjs --scope=<dir or file>,<id prefix>[,<Prefix>* or *<Suffix> to drop from the name] ...')
}

function dropAffix (name, affix) {
  if (affix.endsWith('*') && name.startsWith(affix.slice(0, -1))) {
    return name.slice(affix.length - 1)
  }
  if (affix.startsWith('*') && name.endsWith(affix.slice(1))) {
    return name.slice(0, name.length - affix.length + 1)
  }
  return name
}

const ELEMENT = 1
const ATTRIBUTE = 6
const DIRECTIVE = 7
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ID_PREFIX = /^[a-z0-9]+(?:-[a-z0-9]+)*-$/
const WRAPPERS = new Set(['Transition', 'TransitionGroup', 'Teleport', 'KeepAlive', 'Suspense', 'VMenu', 'VTooltip', 'template'])
const INTERACTIVE_TAGS = new Set([
  'a',
  'button',
  'form',
  'input',
  'select',
  'textarea',
  'RouterLink',
  'MxBalloonPicker',
  'MxButton',
  'MxConfirmDialog',
  'MxDialog',
  'MxIconButton',
  'MxImageCredit',
  'MxLikeButton',
  'MxLink',
  'MxLoadMore',
  'MxPasswordField',
  'MxRatingInput',
  'MxSearchField',
  'MxSegmented',
  'MxShareSheet',
  'MxStepper',
  'MxTextarea',
  'MxTextField',
  'MxUserMenu',
  'VAutocomplete',
  'VBtn',
  'VCheckbox',
  'VFileInput',
  'VRadioGroup',
  'VSelect',
  'VSlider',
  'VSwitch',
  'VTextarea',
  'VTextField',
])
const INTERACTIVE_ROLES = new Set(['button', 'checkbox', 'link', 'menuitem', 'option', 'radio', 'slider', 'switch', 'tab'])
const NAVIGATION_PROPS = new Set(['to', 'href'])

function kebab (name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function vueFiles (path) {
  if (statSync(path).isFile()) {
    return path.endsWith('.vue') ? [path] : []
  }
  return readdirSync(path)
    .toSorted()
    .flatMap(entry => vueFiles(join(path, entry)))
}

const propName = prop => (prop.type === ATTRIBUTE ? prop.name : (prop.name === 'bind' ? prop.arg?.content : null))

function testIdOf (node) {
  for (const prop of node.props) {
    if (prop.type === ATTRIBUTE && prop.name === 'data-testid') {
      return { value: prop.value?.content ?? '', bound: false }
    }
    if (prop.type === DIRECTIVE && prop.name === 'bind' && prop.arg?.content === 'data-testid') {
      return { value: prop.exp?.content.trim() ?? '', bound: true }
    }
  }
  return null
}

const hasDirective = (node, name) => node.props.some(prop => prop.type === DIRECTIVE && prop.name === name)

function forwardsAttrs (node) {
  return node.props.some(prop => prop.type === DIRECTIVE && prop.name === 'bind' && !prop.arg && prop.exp?.content.includes('$attrs'))
}

function isInteractive (node) {
  if (INTERACTIVE_TAGS.has(node.tag)) {
    return true
  }
  if (node.props.some(prop => prop.type === DIRECTIVE && prop.name === 'on' && prop.arg?.content === 'click')) {
    return true
  }
  if (node.props.some(prop => prop.type === ATTRIBUTE && prop.name === 'role' && INTERACTIVE_ROLES.has(prop.value?.content))) {
    return true
  }
  if (node.tag === 'component') {
    const is = node.props.find(prop => propName(prop) === 'is')
    const target = is?.type === DIRECTIVE ? is.exp?.content : is?.value?.content
    return /MxLink|RouterLink|'button'|'a'/.test(target ?? '')
  }
  return /^[A-Z]/.test(node.tag) && node.props.some(prop => NAVIGATION_PROPS.has(propName(prop)))
}

function staticPart (testId) {
  if (!testId.bound) {
    return { text: testId.value, complete: true }
  }
  const literal = /^`([^`$]*)(\$\{)?/.exec(testId.value)
  if (literal) {
    return { text: literal[1], complete: !literal[2] }
  }
  const quoted = /^'([^']*)'$/.exec(testId.value)
  return quoted ? { text: quoted[1], complete: true } : null
}

const location = (file, node) => `${relative(process.cwd(), file)}:${node.loc.start.line}`

const problems = []
let checked = 0
let identified = 0

function walk (nodes, visit) {
  for (const node of nodes) {
    if (node.type !== ELEMENT) {
      continue
    }
    visit(node)
    walk(node.children, visit)
  }
}

for (const scope of scopes) {
  for (const file of vueFiles(scope.path)) {
    const { descriptor, errors } = parse(readFileSync(file, 'utf8'), { filename: file })
    if (errors.length > 0) {
      problems.push(`${relative(process.cwd(), file)}: ${errors[0].message}`)
      continue
    }
    if (!descriptor.template?.ast) {
      continue
    }
    checked += 1
    const name = dropAffix(basename(file, '.vue'), scope.affix)
    const root = `${scope.prefix}${kebab(name)}`
    const nodes = descriptor.template.ast.children
    const chains = []

    for (const node of nodes) {
      if (node.type !== ELEMENT) {
        continue
      }
      if (chains.length > 0 && (hasDirective(node, 'else-if') || hasDirective(node, 'else'))) {
        chains.at(-1).push(node)
      } else {
        chains.push([node])
      }
    }

    for (const node of chains[0] ?? []) {
      if (WRAPPERS.has(node.tag)) {
        let found = false
        walk(node.children, child => {
          if (testIdOf(child)?.value === root) {
            found = true
          }
        })
        if (!found) {
          problems.push(`${location(file, node)}: no element inside <${node.tag}> has data-testid="${root}"`)
        }
      } else if (testIdOf(node)?.value !== root) {
        problems.push(`${location(file, node)}: root <${node.tag}> needs data-testid="${root}"`)
      }
    }

    for (const node of chains.slice(1).flat()) {
      if (!WRAPPERS.has(node.tag) && !testIdOf(node)) {
        problems.push(`${location(file, node)}: extra root <${node.tag}> needs a data-testid ("${root}-…")`)
      }
    }

    walk(nodes, node => {
      const testId = testIdOf(node)
      if (testId) {
        identified += 1
        const part = staticPart(testId)
        if (!part) {
          problems.push(`${location(file, node)}: bind data-testid to a string or template literal that starts with "${root}-"`)
        } else if (part.complete ? !ID.test(part.text) : !ID_PREFIX.test(part.text)) {
          problems.push(`${location(file, node)}: "${part.text}" is not kebab-case`)
        } else if (part.text !== root && !part.text.startsWith(`${root}-`)) {
          problems.push(`${location(file, node)}: "${part.text}" must be "${root}" or start with "${root}-"`)
        }
      } else if (isInteractive(node) && !forwardsAttrs(node)) {
        problems.push(`${location(file, node)}: interactive <${node.tag}> needs a data-testid ("${root}-…")`)
      }
    })
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(problem)
  }
  console.error(`\n${problems.length} data-testid problem(s).`)
  process.exitCode = 1
} else {
  console.log(`data-testid checked: ${checked} components, ${identified} ids.`)
}
