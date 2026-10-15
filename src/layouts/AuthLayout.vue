<template>
  <div class="auth-layout mx-root" :class="{ 'auth-layout--wide': wide }" data-testid="layout-auth">
    <a class="auth-layout__skip" data-testid="layout-auth-skip" href="#auth-content">{{ t('common.skipToContent') }}</a>
    <MxBlobField :count="4" fixed intensity="vivid" seed="mixtape-auth" />

    <header class="auth-layout__header">
      <AppBrand />

      <MxButton
        data-testid="layout-auth-back-home"
        icon="mdi-arrow-left"
        :label="t('auth.backHome')"
        size="sm"
        :to="{ name: ROUTE.home }"
        variant="glass"
      />
    </header>

    <div class="auth-layout__grid">
      <section class="auth-layout__art" :style="artStyle">
        <MxStarburst
          class="auth-layout__burst"
          :color="duotone.accent"
          :ink="duotone.ink"
          :points="14"
          shape="star"
          size="min(70vw, 460px)"
          spin
        />

        <MxVinyl
          class="auth-layout__vinyl"
          finish="gold"
          :label-color="duotone.accent"
          :size="220"
          spinning
        />

        <p class="auth-layout__headline mx-display">{{ t('auth.headline') }}</p>
        <p class="auth-layout__lead">{{ t('auth.lead') }}</p>

        <MxMarquee
          class="auth-layout__marquee"
          duotone="lime"
          :items="marquee"
          :label="t('auth.marqueeLabel')"
          size="md"
          :tilt="-3"
        />
      </section>

      <main id="auth-content" class="auth-layout__main" tabindex="-1">
        <MxGlass class="auth-layout__card" strong variant="sheet">
          <RouterView v-slot="{ Component, route: current }">
            <Transition mode="out-in" name="page">
              <div :key="current.path" class="app-route">
                <component :is="Component" />
              </div>
            </Transition>
          </RouterView>
        </MxGlass>

        <p class="auth-layout__legal">
          <RouterLink data-testid="layout-auth-terms-link" :to="{ name: ROUTE.terms }">{{ t('nav.terms') }}</RouterLink>
          ·
          <RouterLink data-testid="layout-auth-privacy-link" :to="{ name: ROUTE.privacy }">{{ t('nav.privacy') }}</RouterLink>
        </p>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { duotones, MxBlobField, MxButton, MxGlass, MxMarquee, MxStarburst, MxVinyl } from '@pedrolucaslopes/mixtape-ui'
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import AppBrand from '@/components/AppBrand.vue'
  import { ROUTE } from '@/router/routes'

  const { t } = useI18n()
  const route = useRoute()

  const wide = computed(() => route.meta.wide === true)

  const duotone = duotones.violet

  const artStyle = computed(() => ({ '--auth-bg': duotone.background, '--auth-ink': duotone.ink }))

  const marquee = computed(() => (['rate', 'review', 'collect', 'compete', 'win'] as const).map(key => t(`auth.marquee.${key}`)))
</script>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(12px, 2vw, 24px);
}

.auth-layout__skip {
  position: fixed;
  top: 0;
  left: 12px;
  z-index: var(--mx-z-toast);
  padding: 10px 16px;
  font-weight: 800;
  color: var(--mx-on-cta);
  text-decoration: none;
  background: var(--mx-cta);
  border-radius: var(--mx-radius-pill);
  transform: translateY(-120%);
  transition: transform var(--mx-duration-fast) var(--mx-ease-out);
}

.auth-layout__skip:focus {
  transform: translateY(12px);
}

.auth-layout__header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 1240px;
  margin: 0 auto 16px;
}

.auth-layout__grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: clamp(16px, 3vw, 32px);
  max-width: 1240px;
  margin: 0 auto;
}

@media (min-width: 960px) {
  .auth-layout__grid {
    grid-template-columns: minmax(0, 1fr) minmax(380px, 480px);
    align-items: stretch;
    min-height: calc(100dvh - 120px);
  }

  .auth-layout--wide .auth-layout__grid {
    grid-template-columns: minmax(0, 0.85fr) minmax(440px, 660px);
  }
}

.auth-layout__art {
  position: relative;
  isolation: isolate;
  display: grid;
  align-content: end;
  gap: 14px;
  min-height: 260px;
  padding: clamp(24px, 5vw, 56px);
  overflow: hidden;
  color: var(--auth-ink);
  background: var(--auth-bg);
  border-radius: var(--mx-radius-xl);
  animation: auth-art-in var(--mx-spring-bouncy-duration) var(--mx-spring-bouncy) both;
}

.auth-layout__burst {
  position: absolute;
  top: -18%;
  right: -16%;
  z-index: -1;
  opacity: 0.95;
}

.auth-layout__vinyl {
  position: absolute;
  top: 12%;
  right: 8%;
  z-index: -1;
  display: none;
}

@media (min-width: 960px) {
  .auth-layout__art {
    min-height: 0;
  }

  .auth-layout__vinyl {
    display: block;
  }
}

.auth-layout__headline {
  max-width: 12ch;
  margin: 0;
  font-size: var(--mx-text-display-xl);
  overflow-wrap: anywhere;
}

.auth-layout__lead {
  max-width: 44ch;
  margin: 0;
  font-size: clamp(1rem, 1.6vw, 1.1875rem);
  font-weight: 650;
  line-height: 1.5;
}

.auth-layout__marquee {
  margin: 12px calc(-1 * clamp(24px, 5vw, 56px)) 0;
}

.auth-layout__main {
  display: grid;
  align-content: center;
  gap: 12px;
  outline: none;
}

.auth-layout__card {
  padding: clamp(22px, 4vw, 40px);
  animation: auth-card-in var(--mx-spring-smooth-duration) var(--mx-spring-smooth) 120ms both;
}

.auth-layout__legal {
  margin: 0;
  font-size: 0.8125rem;
  text-align: center;
  color: var(--mx-on-surface-muted);
}

.auth-layout__legal a {
  font-weight: 700;
  color: inherit;
}

@keyframes auth-art-in {
  from { transform: translate3d(0, 24px, 0) rotate(-2deg) scale(0.97); }
  to { transform: none; }
}

@keyframes auth-card-in {
  from { opacity: 0; transform: translate3d(0, 24px, 0); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .auth-layout__art,
  .auth-layout__card {
    animation: none;
  }
}
</style>
