import { newAccount, register } from './support/accounts'
import { ANONYMOUS, API_PATHS } from './support/constants'
import { expect, test } from './support/fixtures'
import { signedIn } from './support/session'

const peopleSearch = (text: string) => `/search?type=people&q=${encodeURIComponent(text)}`

test('busca uma pessoa pelo @usuário, sem diferenciar maiúsculas, e abre o perfil dela', async ({ page, request, pageErrors }) => {
  const account = newAccount('e2e_people')
  await register(request, account)
  await page.goto(peopleSearch(`@${account.username.toUpperCase()}`))
  const card = page.getByTestId('page-search-person').filter({ hasText: `@${account.username}` })
  await expect(card).toBeVisible()
  await card.click()
  await expect(page).toHaveURL(new RegExp(`/u/${account.username}$`))
  await expect(page.getByTestId('page-profile')).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('o e-mail nunca acha ninguém', async ({ page, request }) => {
  const account = newAccount('e2e_people')
  await register(request, account)
  await page.goto(peopleSearch(account.email))
  await expect(page.getByTestId('mx-empty-state')).toBeVisible()
  await expect(page.getByTestId('page-search-person')).toHaveCount(0)
})

signedIn('o dono vê o progresso do disco e das badges; quem visita, só o conquistado', async ({ page, browser, request }) => {
  await page.goto('/me')
  await expect(page.getByTestId('page-profile')).toBeVisible()
  await expect(page.getByTestId('mx-disc-progress')).toBeVisible()
  await expect(page.getByTestId('mx-badge-next').first()).toBeVisible()
  const username = new URL(page.url()).pathname.split('/').pop() ?? ''

  const visitor = await browser.newContext(ANONYMOUS)
  const other = await visitor.newPage()
  await other.goto(`/u/${username}`)
  await expect(other.getByTestId('progress-panel')).toBeVisible()
  await expect(other.getByTestId('mx-disc-progress')).toHaveCount(0)
  await expect(other.getByTestId('mx-badge-ring')).toHaveCount(0)
  await expect(other.getByTestId('mx-badge-next')).toHaveCount(0)
  await visitor.close()

  const progress = await (await request.get(API_PATHS.progress(username))).json() as { disc: object, badges: Array<{ tier: number }> }
  expect(Object.keys(progress.disc).toSorted()).toEqual(['label', 'tier'])
  expect(progress.badges.every(badge => badge.tier > 0 && !('progress' in badge) && !('next' in badge))).toBe(true)
})
