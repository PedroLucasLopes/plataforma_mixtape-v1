import { readFile, writeFile } from 'node:fs/promises'

const KEY_LINE = /^\s*([A-Z][A-Z0-9_]*)\s*=/

function serialize (value) {
  const text = String(value)
  return /[\s#"'$`\\]/.test(text) ? `"${text.replaceAll('\\', '\\\\').replaceAll('"', String.raw`\"`)}"` : text
}

export function upsertEnv (content, values) {
  const lines = content.length > 0 ? content.split(/\r?\n/) : []
  if (lines.at(-1) === '') {
    lines.pop()
  }
  const pending = new Map(Object.entries(values))
  const updated = lines.map(line => {
    const key = KEY_LINE.exec(line)?.[1]
    if (!key || !pending.has(key)) {
      return line
    }
    const value = pending.get(key)
    pending.delete(key)
    return `${key}=${serialize(value)}`
  })
  for (const [key, value] of pending) {
    updated.push(`${key}=${serialize(value)}`)
  }
  return `${updated.join('\n')}\n`
}

export async function writeEnvFile (path, values) {
  const current = await readFile(path, 'utf8').catch(() => '')
  await writeFile(path, upsertEnv(current, values), { encoding: 'utf8', mode: 0o600 })
  return Object.keys(values)
}
