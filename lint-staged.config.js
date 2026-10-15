const quoted = files => files.map(file => `"${file.replaceAll('\\', '/')}"`).join(' ')

const MANY_FILES = 40

const CHECKS = [
  [/src\/.+\.vue$/, ['npm run check:testids']],
  [/src\/locales\/[^/]+\.json$/, ['npm run check:locales']],
  [/src\/.+\.(ts|vue)$/, ['npm run check:locales', 'npm run check:icons']],
]

export default {
  '*.{ts,vue,js,mjs}': files => (files.length > MANY_FILES ? 'npm run lint:fix' : `eslint --fix --no-warn-ignored ${quoted(files)}`),
  '*': files => {
    const paths = files.map(file => file.replaceAll('\\', '/'))
    return [...new Set(CHECKS.flatMap(([pattern, commands]) => (paths.some(path => pattern.test(path)) ? commands : [])))]
  },
}
