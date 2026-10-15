import { SAMPLE } from './support/constants'
import { expect } from './support/fixtures'
import { signedIn as test } from './support/session'

test.describe.configure({ mode: 'serial' })

test('favorita um álbum e ele aparece na vitrine do perfil', async ({ page, pageErrors }) => {
  await page.goto(`/albums/${SAMPLE.album}`)
  const star = page.getByTestId('favorite-button')
  await expect(star).toBeVisible()
  if ((await star.getAttribute('aria-pressed')) === 'true') {
    await star.click()
    await expect(star).toHaveAttribute('aria-pressed', 'false')
  }
  await star.click()
  await expect(star).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/me')
  const shelf = page.getByTestId('favorites-shelf')
  await expect(shelf.getByTestId('favorites-shelf-item').first()).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('tira o favorito pelo editor da vitrine', async ({ page }) => {
  await page.goto('/me')
  await page.getByTestId('favorites-shelf-edit').click()
  const editor = page.getByTestId('favorites-editor-dialog')
  await expect(editor).toBeVisible()
  const rows = editor.getByTestId('favorites-editor-dialog-row')
  const before = await rows.count()
  await editor.getByTestId('favorites-editor-dialog-remove').first().click()
  await expect(rows).toHaveCount(before - 1)
  await editor.getByTestId('favorites-editor-dialog-save').click()
  await expect(editor).toBeHidden()
  await expect(page.getByTestId('favorites-shelf-item')).toHaveCount(before - 1)
})
