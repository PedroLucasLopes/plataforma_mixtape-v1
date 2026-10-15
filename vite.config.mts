import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import Vuetify from 'vite-plugin-vuetify'

/**
 * Marcador do nonce da política de conteúdo. O Vite o escreve em cada <script>/<style> gerado e o
 * nginx de produção troca pelo `$request_id` de cada resposta (sub_filter), o mesmo valor que vai no
 * header Content-Security-Policy.
 */
const CSP_NONCE_PLACEHOLDER = 'MIXTAPE_CSP_NONCE'

/**
 * SEO para quem não executa JavaScript (Googlebot, Bing, WhatsApp, Telegram, X, Facebook...): no
 * build, o bloco `seo:start/seo:end` do index.html vira um include SSI do nginx. Para robôs, o nginx
 * busca na API o <head> da página pedida (título, descrição, Open Graph e JSON-LD); para pessoas,
 * fica o <head> padrão e o app atualiza tudo no navegador. Em `npm run dev` nada muda.
 */
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

/**
 * Fontes do primeiro quadro, pré-carregadas: o título do herói (Bricolage) costuma ser o LCP, e sem o
 * preload o navegador só descobre o woff2 depois de baixar e ler o CSS. Só o subconjunto latino, que
 * cobre pt-BR, en e es; os outros continuam sob demanda pelo `unicode-range` do Fontsource.
 */
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

/** Mesmos headers que o nginx de produção manda, para o modo de desenvolvimento não mascarar nada. */
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': 'frame-ancestors \'none\'',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Onde a API atende em desenvolvimento. O navegador fala só com o Vite (mesma origem).
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
      // A biblioteca declara vue e vuetify como peer: duas cópias quebrariam `inject`.
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
