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

test('na pilha da biblioteca, o disco da frente já vem aberto, com a nota e os atalhos', async ({ page, pageErrors }) => {
  await page.goto(`/albums/${SAMPLE.album}`)
  const title = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
  // O do topo: sem avaliação nenhuma no álbum, o estado vazio mostra outro "Avaliar".
  const rate = page.getByTestId('mx-page-hero').getByTestId('rate-button')
  await rate.click()
  const composer = page.getByTestId('review-composer')
  await expect(composer).toBeVisible()
  const slider = composer.getByTestId('mx-rating-input-slider')
  await slider.focus()
  await slider.press('End')
  await composer.getByTestId('review-composer-submit').click()
  await expect(composer).toBeHidden()
  await closeCelebration(page)

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

  await page.goto(`/albums/${SAMPLE.album}`)
  await rate.click()
  await expect(composer).toBeVisible()
  await composer.getByTestId('review-composer-delete').click()
  await page.getByTestId('review-composer-delete-confirm').getByTestId('mx-confirm-dialog-confirm').click()
  await expect(composer).toBeHidden()
})
