import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import { currentLocale, loadLocale } from '@/plugins/i18n'
import { reloadOnce } from '@/utils/deploy'
import App from './App.vue'
import './styles/main.css'

for (const element of document.querySelectorAll('[data-mx-ssr]')) {
  element.remove()
}

// Chunk de antes do último deploy: a navegação trata o dela (abre o destino); o resto recarrega aqui.
window.addEventListener('vite:preloadError', () => {
  window.setTimeout(() => reloadOnce(), 0)
})

const app = createApp(App)

registerPlugins(app)

await loadLocale(currentLocale())

app.mount('#app')
