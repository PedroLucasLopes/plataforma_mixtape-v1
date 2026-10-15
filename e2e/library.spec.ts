import type { Page } from '@playwright/test'
import { SAMPLE } from './support/constants'
import { expect } from './support/fixtures'
import { signedIn as test } from './support/session'

async function closeCelebration (page: Page): Promise<void> {
  const celebration = page.getByTestId('celebration-dialog')
  if (await celebration.isVisible()) {
    await celebration.getByTestId('celebration-dialog-continue').click()
  }
}

/** Dá nota máxima pela página do item e devolve o título dela. */
async function rateItem (page: Page, path: string): Promise<string> {
  await page.goto(path)
  const title = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
  // O do topo: sem avaliação nenhuma no item, o estado vazio mostra outro "Avaliar".
  await page.getByTestId('mx-page-hero').getByTestId('rate-button').click()
  const composer = page.getByTestId('review-composer')
  await expect(composer).toBeVisible()
  const slider = composer.getByTestId('mx-rating-input-slider')
  await slider.focus()
  await slider.press('End')
  await composer.getByTestId('review-composer-submit').click()
  await expect(composer).toBeHidden()
  await closeCelebration(page)
  return title
}

async function removeReview (page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.getByTestId('mx-page-hero').getByTestId('rate-button').click()
  const composer = page.getByTestId('review-composer')
  await expect(composer).toBeVisible()
  await composer.getByTestId('review-composer-delete').click()
  await page.getByTestId('review-composer-delete-confirm').getByTestId('mx-confirm-dialog-confirm').click()
  await expect(composer).toBeHidden()
}

test('na pilha da biblioteca, o disco da frente já vem aberto, com a nota e os atalhos', async ({ page, pageErrors }) => {
  const title = await rateItem(page, `/albums/${SAMPLE.album}`)

  await page.goto('/library')
  await expect(page).toHaveURL(/\/library/)
  await page.getByTestId('page-library-view').getByTestId('mx-segmented-option-crate').click()
  await expect(page).toHaveURL(/view=crate/)
  const crate = page.getByTestId('review-crate')
  const panel = crate.getByTestId('mx-crate-pulled')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(title)
  await expect(panel.getByTestId('crate-pulled-card-review')).toBeVisible()
  await expect(panel.getByTestId('crate-pulled-card-open')).toHaveAttribute('href', /\/albums\//)
  await expect(crate.getByTestId('mx-crate-pull')).toHaveCount(0)
  expect(pageErrors).toEqual([])

  await removeReview(page, `/albums/${SAMPLE.album}`)
})

test('na grade da biblioteca, o álbum e a música dele avaliados viram uma pilha que abre e fecha', async ({ page, pageErrors }) => {
  // A música de exemplo é do álbum de exemplo.
  const album = await rateItem(page, `/albums/${SAMPLE.album}`)
  const track = await rateItem(page, `/tracks/${SAMPLE.track}`)

  await page.goto('/library')
  await expect(page).toHaveURL(/\/library/)
  const grid = page.getByTestId('review-grid')
  const stack = grid.getByTestId('review-grid-stack')
  await expect(stack).toHaveCount(1)
  await expect(stack).toHaveAttribute('aria-expanded', 'false')
  await expect(grid.getByTestId('review-grid-entry').filter({ has: page.getByTestId('review-grid-stack') })).toContainText(album)
  // Fechada, a música não aparece sozinha na grade.
  await expect(grid.getByTestId('review-grid-entry').filter({ hasText: track })).toHaveCount(0)
  await expect(grid.getByTestId('review-grid-member')).toHaveCount(0)

  await stack.click()
  await expect(stack).toHaveAttribute('aria-expanded', 'true')
  const member = grid.getByTestId('review-grid-member')
  await expect(member).toHaveCount(1)
  await expect(member).toContainText(track)
  await expect(member).toContainText(album)
  await expect(member.getByTestId('review-grid-link')).toHaveAttribute('href', /\/reviews\//)

  await stack.press('Enter')
  await expect(stack).toHaveAttribute('aria-expanded', 'false')
  await expect(member).toHaveCount(0)
  expect(pageErrors).toEqual([])

  await removeReview(page, `/tracks/${SAMPLE.track}`)
  await removeReview(page, `/albums/${SAMPLE.album}`)
})
