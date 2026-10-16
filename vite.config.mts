import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import Vuetify from 'vite-plugin-vuetify'

const CSP_NONCE_PLACEHOLDER = 'MIXTAPE_CSP_NONCE'

function ssiSeoHead (): Plugin {
  return {
    name: 'mixtape-ssi-seo-head',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: html => html.replace(/<!-- seo:start -->([\s\S]*?)<!-- seo:end -->/, (_match, defaults: string) => [
        `<!--# block name="seo_default" -->${defaults}<!--# endblock -->`,
        '<!--# if expr="$mixtape_seo_bot" -->',
        '<!--# include virtual="/__seo/head" stub="seo_default" -->',
        '<!--# else -->',
        defaults,
        '<!--# endif -->',
      ].join('\n')),
    },
  }
}

const PRELOADED_FONTS = [
  /\/bricolage-grotesque-latin-standard-normal-[\w-]+\.woff2$/,
  /\/figtree-latin-wght-normal-[\w-]+\.woff2$/,
]

function preloadFonts (patterns: RegExp[]): Plugin {
  let base = '/'
  return {
    name: 'mixtape-preload-fonts',
    apply: 'build',
    configResolved (config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler: (_html, { bundle }) => Object.keys(bundle ?? {})
        .filter(file => patterns.some(pattern => pattern.test(`/${file}`)))
        .map(file => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `${base}${file}`, as: 'font', type: 'font/woff2', crossorigin: true },
          injectTo: 'head' as const,
        })),
    },
  }
}

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': 'frame-ancestors \'none\'',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.MIXTAPE_DEV_API ?? 'http://localhost:3000'
  const proxy = {
    '/api': { target: apiTarget },
    '/ads.txt': { target: apiTarget },
  }

  return {
    plugins: [
      Vue(),
      Vuetify({ autoImport: true }),
      ssiSeoHead(),
      preloadFonts(PRELOADED_FONTS),
    ],
    html: mode === 'production' ? { cspNonce: CSP_NONCE_PLACEHOLDER } : undefined,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
      dedupe: ['vue', 'vuetify'],
    },
    server: {
      port: 5180,
      strictPort: true,
      headers: securityHeaders,
      proxy,
    },
    preview: {
      port: 5180,
      strictPort: true,
      headers: securityHeaders,
      proxy,
    },
    build: {
      chunkSizeWarningLimit: 900,
    },
  }
})
