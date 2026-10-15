import { useHead, useSeoMeta } from '@unhead/vue'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useRoute } from 'vue-router'
import { SEO } from '@/constants/seo'

export interface SeoInput {
  title?: string | null
  socialTitle?: string | null
  description?: string | null
  image?: string | null
  type?: string
  noindex?: boolean
}

export function useSeo (input: MaybeRefOrGetter<SeoInput>) {
  const route = useRoute()
  const value = computed(() => toValue(input))
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const canonical = computed(() => `${origin}${route.path}`)
  const image = computed(() => {
    const raw = value.value.image
    if (!raw) {
      return `${origin}${SEO.defaultImagePath}`
    }
    return raw.startsWith('http') ? raw : `${origin}${raw}`
  })

  const socialTitle = computed(() => value.value.socialTitle ?? value.value.title ?? undefined)
  const description = computed(() => {
    const text = value.value.description?.replace(/\s+/g, ' ').trim()
    if (!text) {
      return undefined
    }
    return text.length > SEO.descriptionMaxLength ? `${text.slice(0, SEO.descriptionMaxLength - 1).trimEnd()}…` : text
  })

  useSeoMeta({
    title: () => value.value.title ?? undefined,
    description: () => description.value,
    ogTitle: () => socialTitle.value,
    ogDescription: () => description.value,
    ogType: () => (value.value.type ?? 'website') as 'website',
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogSiteName: SEO.siteName,
    twitterCard: 'summary_large_image',
    twitterTitle: () => socialTitle.value,
    twitterDescription: () => description.value,
    twitterImage: () => image.value,
    robots: () => (value.value.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'),
  })

  useHead({
    link: [{ rel: 'canonical', href: () => canonical.value }],
  })
}
