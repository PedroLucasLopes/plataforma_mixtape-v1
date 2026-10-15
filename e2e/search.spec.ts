import type { Page } from '@playwright/test'
import { ANONYMOUS, API_PATHS, SESSION_HEADER } from './support/constants'
import { expect, test } from './support/fixtures'
import { signedIn } from './support/session'

const QUERY = 'radiohead'

/** Busca pela URL, espera os resultados e devolve o campo de busca da página. */
async function searchFor (page: Page, query: string) {
  await page.goto(`/search?q=${encodeURIComponent(query)}`)
  await expect(page.getByTestId('page-search-result-rate').first()).toBeVisible()
  return page.getByTestId('page-search-field')
}

/** De volta ao estado sem busca: a URL sem `q`, nenhum resultado e a busca feita entre as recentes. */
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
  // A conta dos testes nasce sem estilos, e "Para você" sai deles. Grava pela API, com a sessão da página: na tela,
  // a lista de estilos é virtualizada e "rock" fica depois de dezenas de "… rock".
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
  // O foco foi para dentro da primeira sugestão nova.
  await expect(items.nth(before).locator(':focus')).toHaveCount(1)
  expect(pageErrors).toEqual([])
})
