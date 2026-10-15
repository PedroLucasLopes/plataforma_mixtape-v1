import type { Locator } from '@playwright/test'
import { expect } from './support/fixtures'
import { signedIn as test } from './support/session'

const labels = (stack: Locator) => stack.getByRole('option').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')))

test('o cartão Descubra do meu perfil mostra 10 álbuns sorteados e sorteia outros', async ({ page, pageErrors }) => {
  await page.goto('/me')
  const card = page.getByTestId('discover-card')
  await expect(card.getByTestId('mx-crate-record').first()).toBeVisible()
  await expect(card).toContainText('Disco 1 de 10')

  const before = await labels(card)
  await card.getByTestId('discover-card-shuffle').click()
  await expect.poll(() => labels(card)).not.toEqual(before)
  expect(pageErrors).toEqual([])
})

test('o mouse folheia a pilha do cartão subindo, traz os discos de volta descendo, e o clique abre o disco', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/me')
  const card = page.getByTestId('discover-card')
  const pile = card.getByTestId('mx-crate-pile')
  await expect(card.getByTestId('mx-crate-record').first()).toBeVisible()
  await pile.scrollIntoViewIfNeeded()
  const box = (await pile.boundingBox())!
  const x = box.x + box.width / 2
  const bottom = box.y + box.height - 12

  await page.mouse.move(x, bottom)
  await page.mouse.move(x, bottom - 26 * 3 - 4, { steps: 6 })
  await expect(card).toContainText('Disco 4 de 10')
  await page.mouse.move(x, bottom - 26 - 4, { steps: 6 })
  await expect(card).toContainText('Disco 2 de 10')

  await page.mouse.click(x, bottom - 26 - 4)
  const dialog = page.getByTestId('discover-card-dialog')
  await expect(dialog.getByTestId('crate-pulled-card')).toBeVisible()
  await expect(dialog).toContainText('no ListenBrainz')
  await expect(dialog.getByTestId('crate-pulled-card-open')).toHaveAttribute('href', /\/albums\//)
  await dialog.getByTestId('mx-dialog-close').click()
  await expect(dialog).toBeHidden()
})

test('em tela larga o Descubra fica numa coluna ao lado dos destaques; em tela menor, vira uma seção do perfil', async ({ page }) => {
  await page.goto('/me')
  const aside = page.locator('.profile__aside').getByTestId('discover-card')
  await expect(aside.getByTestId('mx-crate-record').first()).toBeVisible()
  const highlights = await page.locator('.story-grid').boundingBox()
  const card = await aside.boundingBox()
  expect(card!.x).toBeGreaterThan(highlights!.x + highlights!.width)

  await page.setViewportSize({ width: 900, height: 900 })
  await expect(page.locator('.profile__aside')).toHaveCount(0)
  const section = page.getByTestId('discover-card')
  await expect(section.getByTestId('mx-crate-next')).toBeVisible()
  await section.getByTestId('mx-crate-pull').click()
  await expect(section.getByTestId('crate-pulled-card')).toBeVisible()
})

test('quem visita o meu perfil não vê o Descubra', async ({ page, browser }) => {
  await page.goto('/me')
  await expect(page).toHaveURL(/\/u\//)
  await expect(page.getByTestId('discover-card')).toBeVisible()

  const anonymous = await browser.newContext({ storageState: { cookies: [], origins: [] } })
  const visitor = await anonymous.newPage()
  await visitor.goto(page.url())
  await expect(visitor.getByTestId('page-profile')).toBeVisible()
  await expect(visitor.getByTestId('discover-card')).toHaveCount(0)
  await anonymous.close()
})
