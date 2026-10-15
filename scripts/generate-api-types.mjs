import { execFileSync } from 'node:child_process'

const source = process.env.MIXTAPE_OPENAPI_URL ?? 'http://localhost:3000/docs/openapi.json'
const output = 'src/types/api.generated.ts'

execFileSync('npx', ['--yes', 'openapi-typescript@7.13.0', source, '--output', output, '--alphabetize'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

console.log(`API types generated from ${source} into ${output}`)
