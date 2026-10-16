import type { Page } from '@playwright/test'
import { ANONYMOUS, API_PATHS, SESSION_HEADER } from './support/constants'
import { expect, test } from './support/fixtures'
import { signedIn } from './support/session'

const QUERY = 'radiohead'

async function searchFor (page: Page, query: string) {
  await page.goto(`/search?q=${encodeURIComponent(query)}`)
  await expect(page.getByTestId('page-search-result-rate').first()).toBeVisible()
  return page.getByTestId('page-search-field')
}

async function expectIdle (page: Page): Promise<void> {
  await expect(page).not.toHaveURL(/[?&]q=/)
  await expect(page.getByTestId('page-search-result-rate')).toHaveCount(0)
  await expect(page.getByTestId('page-search-recent').filter({ hasText: QUERY })).toBeVisible()
}

test.describe('sem conta', () => {
  test.use(ANONYMOUS)

  test('Enter com o campo vazio desfaz a busca e volta às sugestões', async ({ page, pageErrors }) => {
    const field = await searchFor(page, QUERY)
    const input = field.getByTestId('mx-search-field-input')
    await input.fill('')
    await input.press('Enter')
    await expectIdle(page)
    expect(pageErrors).toEqual([])
  })

  test('o botão de limpar também volta às sugestões', async ({ page, pageErrors }) => {
    const field = await searchFor(page, QUERY)
    await field.getByTestId('mx-search-field-clear').click()
    await expectIdle(page)
    await expect(field.getByTestId('mx-search-field-input')).toHaveValue('')
    expect(pageErrors).toEqual([])
  })
})

signedIn('"Mais sugestões" traz as próximas e rola o trilho até a primeira nova, com o foco nela', async ({ page, pageErrors }) => {
  const refresh = await page.request.post(API_PATHS.refresh, { headers: SESSION_HEADER, data: {} })
  expect(refresh.status()).toBe(200)
  const { tokens } = await refresh.json() as { tokens: { accessToken: string } }
  const saved = await page.request.patch(API_PATHS.profile, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    data: { favoriteGenres: ['rock'] },
  })
  expect(saved.ok()).toBe(true)

  await page.goto('/search')
  const more = page.getByTestId('page-search-more')
  await expect(more).toBeVisible({ timeout: 60_000 })
  const track = page.getByTestId('home-rail').first().getByTestId('mx-rail-track')
  const items = track.locator(':scope > li')
  const before = await items.count()

  await more.click()
  await expect.poll(() => items.count()).toBeGreaterThan(before)
  await expect.poll(() => track.evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  await expect(items.nth(before).locator(':focus')).toHaveCount(1)
  expect(pageErrors).toEqual([])
})
