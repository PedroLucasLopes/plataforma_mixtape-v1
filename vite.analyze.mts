import type { Plugin } from 'vite'
import { mergeConfig } from 'vite'
import base from './vite.config.mts'

function chunkReport (): Plugin {
  return {
    name: 'mixtape-chunk-report',
    apply: 'build',
    generateBundle (_options, bundle) {
      const chunks = Object.values(bundle)
        .filter(item => item.type === 'chunk')
        .toSorted((a, b) => b.code.length - a.code.length)
        .slice(0, 4)
      for (const chunk of chunks) {
        if (chunk.type !== 'chunk') {
          continue
        }
        const groups = new Map<string, number>()
        for (const [id, info] of Object.entries(chunk.modules)) {
          const match = /node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/.exec(id)
          const key = match ? match[1]! : (id.includes('locales') ? `locale ${id.split(/[\\/]/).at(-1)}` : 'app')
          groups.set(key, (groups.get(key) ?? 0) + info.renderedLength)
        }
        const top = [...groups.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 14)
        console.info(`\n${chunk.fileName} ${Math.round(chunk.code.length / 1024)} KB\n${top.map(([key, size]) => `  ${key}: ${Math.round(size / 1024)} KB`).join('\n')}`)
      }
    },
  }
}

export default mergeConfig(await base({ mode: 'production', command: 'build', isSsrBuild: false, isPreview: false }), {
  plugins: [chunkReport()],
  build: { outDir: 'node_modules/.tmp/analyze', emptyOutDir: true },
})
