import { SAMPLE } from './support/constants'
import { expect, test } from './support/fixtures'

const PAGES = [
  { path: '/', id: 'page-home', layout: 'layout-app' },
  { path: '/search', id: 'page-search', layout: 'layout-app' },
  { path: '/charts', id: 'page-charts', layout: 'layout-app' },
  { path: '/reviews', id: 'page-reviews-feed', layout: 'layout-app' },
  { path: '/rankings', id: 'page-rankings', layout: 'layout-app' },
  { path: '/awards', id: 'page-awards', layout: 'layout-app' },
  { path: '/how-it-works', id: 'page-how-it-works', layout: 'layout-app' },
  { path: '/privacy', id: 'page-legal', layout: 'layout-app' },
  { path: '/terms', id: 'page-legal', layout: 'layout-app' },
  { path: `/albums/${SAMPLE.album}`, id: 'page-album', layout: 'layout-app' },
  { path: `/tracks/${SAMPLE.track}`, id: 'page-track', layout: 'layout-app' },
  { path: `/artists/${SAMPLE.artist}`, id: 'page-artist', layout: 'layout-app' },
  { path: '/login', id: 'page-login', layout: 'layout-auth' },
  { path: '/register', id: 'page-register', layout: 'layout-auth' },
  { path: '/forgot-password', id: 'page-forgot-password', layout: 'layout-auth' },
  { path: '/reset-password', id: 'page-reset-password', layout: 'layout-auth' },
  { path: '/esta-pagina-nao-existe', id: 'page-not-found', layout: 'layout-app' },
]

for (const entry of PAGES) {
  test(`${entry.path} mostra ${entry.id}`, async ({ page, pageErrors }) => {
    await page.goto(entry.path)
    await expect(page.getByTestId(entry.layout)).toBeVisible()
    await expect(page.getByTestId(entry.id)).toBeVisible()
    expect(pageErrors).toEqual([])
  })
}

test('a navegação principal leva a cada seção', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no celular a navegação é a barra de abas')
  await page.goto('/')
  const links = page.getByTestId('layout-app-nav-link')
  await expect(links.first()).toBeVisible()
  await links.filter({ hasText: /paradas/i }).click()
  await expect(page.getByTestId('page-charts')).toBeVisible()
})

test('a barra de abas do celular marca a seção atual', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'a barra de abas só aparece no celular')
  await page.goto('/charts')
  await expect(page.getByTestId('mx-tab-bar-item-charts')).toHaveAttribute('aria-current', 'page')
})
