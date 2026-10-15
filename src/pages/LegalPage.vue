<template>
  <article class="page page--reading legal" data-testid="page-legal">
    <header class="page-header">
      <p class="page-header__eyebrow">{{ t('legal.eyebrow') }}</p>
      <h1 class="page-header__title">{{ t(`legal.${document}.title`) }}</h1>
      <p class="page-header__lead">{{ t(`legal.${document}.lead`) }}</p>
      <p class="muted legal__updated">{{ t('legal.updated', { date: formatDate(LEGAL_UPDATED_AT, locale, { dateStyle: 'long', timeZone: 'UTC' }) }) }}</p>
    </header>

    <nav :aria-label="t('legal.toc')" class="legal__toc">
      <p class="legal__toc-title">{{ t('legal.toc') }}</p>

      <ol>
        <li v-for="section in sections" :key="section">
          <a data-testid="page-legal-section" :href="`#${section}`">{{ t(`legal.${document}.sections.${section}.title`) }}</a>
        </li>
      </ol>
    </nav>

    <div class="prose">
      <section v-for="section in sections" :id="section" :key="section" class="legal__section">
        <h2>{{ t(`legal.${document}.sections.${section}.title`) }}</h2>

        <template v-for="(block, index) in blocks(section)" :key="index">
          <ul v-if="block.type === 'list'">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>

          <p v-else>{{ block.text }}</p>
        </template>
      </section>
    </div>

    <p class="legal__switch">
      <RouterLink class="link-strong" data-testid="page-legal-terms-link" :to="{ name: document === 'privacy' ? ROUTE.terms : ROUTE.privacy }">
        {{ document === 'privacy' ? t('nav.terms') : t('nav.privacy') }}
      </RouterLink>
    </p>
  </article>
</template>

<script lang="ts" setup>
  import { formatDate } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSeo } from '@/composables/useSeo'
  import { LEGAL_CONTACT_EMAIL, LEGAL_SECTIONS, LEGAL_UPDATED_AT, type LegalDocument } from '@/constants/legal'
  import { ROUTE } from '@/router/routes'

  type Block = { type: 'list', items: string[] } | { type: 'paragraph', text: string }

  const props = defineProps<{ document: LegalDocument }>()

  const { t, locale } = useI18n()

  const sections = computed(() => LEGAL_SECTIONS[props.document])

  function blocks (section: string): Block[] {
    const contact = LEGAL_CONTACT_EMAIL ? t('legal.contactEmail', { email: LEGAL_CONTACT_EMAIL }) : t('legal.contactFallback')
    const text = t(`legal.${props.document}.sections.${section}.body`, { contact })
    return text.split(/\n{2,}/).map(chunk => {
      const lines = chunk.split('\n').map(line => line.trim()).filter(Boolean)
      return lines.length > 0 && lines.every(line => line.startsWith('- '))
        ? { type: 'list', items: lines.map(line => line.slice(2)) }
        : { type: 'paragraph', text: lines.join(' ') }
    })
  }

  useSeo(() => ({ title: t(`legal.${props.document}.title`), description: t(`legal.${props.document}.lead`) }))
</script>

<style scoped>
.legal__updated {
  margin: 0;
  font-size: 0.875rem;
}

.legal__toc {
  padding: 18px 22px;
  background: var(--mx-surface);
  border-radius: var(--mx-radius-lg);
}

.legal__toc-title {
  margin: 0 0 8px;
  font-size: var(--mx-text-overline);
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mx-link);
}

.legal__toc ol {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-inline-start: 1.4em;
}

.legal__toc a {
  font-weight: 700;
  color: inherit;
}

.legal__toc a:focus-visible {
  outline: 3px solid var(--mx-focus);
  outline-offset: 2px;
}

.legal__section {
  display: grid;
  gap: 12px;
  scroll-margin-top: calc(var(--mx-top-bar-height) + 16px);
}

.legal__switch {
  margin: 0;
}
</style>
