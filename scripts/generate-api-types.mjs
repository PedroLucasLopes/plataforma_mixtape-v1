import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import ts from 'typescript'

const source = process.env.MIXTAPE_OPENAPI_URL ?? 'http://localhost:3000/docs/openapi.json'
const output = 'src/types/api.generated.ts'

execFileSync('npx', ['--yes', 'openapi-typescript@7.13.0', source, '--output', output, '--alphabetize'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

const generated = ts.createSourceFile(output, readFileSync(output, 'utf8'), ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
writeFileSync(output, ts.createPrinter({ removeComments: true }).printFile(generated), 'utf8')

console.log(`API types generated from ${source} into ${output}`)
