import { SAMPLE } from './support/constants'
import { expect } from './support/fixtures'
import { signedIn as test } from './support/session'

test('avalia um álbum pelo teclado e apaga a avaliação', async ({ page }) => {
  await page.goto(`/albums/${SAMPLE.album}`)
  // O do topo: sem avaliação nenhuma no álbum, o estado vazio mostra outro "Avaliar".
  const rate = page.getByTestId('mx-page-hero').getByTestId('rate-button')
  await rate.click()

  const composer = page.getByTestId('review-composer')
  await expect(composer).toBeVisible()
  const slider = composer.getByTestId('mx-rating-input-slider')
  await slider.focus()
  await slider.press('End')
  await slider.press('ArrowLeft')
  await expect(slider).toHaveAttribute('aria-valuenow', '4.5')
  await composer.getByTestId('review-composer-body').getByRole('textbox').fill('Teste automático: o lado B segura o disco inteiro.')
  await composer.getByTestId('review-composer-submit').click()
  await expect(composer).toBeHidden()

  const celebration = page.getByTestId('celebration-dialog')
  if (await celebration.isVisible()) {
    await celebration.getByTestId('celebration-dialog-continue').click()
  }

  await expect(rate).toContainText('4,5')
  await rate.click()
  await expect(composer).toBeVisible()
  await composer.getByTestId('review-composer-delete').click()
  await page.getByTestId('review-composer-delete-confirm').getByTestId('mx-confirm-dialog-confirm').click()
  await expect(composer).toBeHidden()
  await expect(rate).not.toContainText('4,5')
})
