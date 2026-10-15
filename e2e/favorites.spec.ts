import type { Page } from '@playwright/test'
import { SAMPLE } from './support/constants'
import { expect } from './support/fixtures'
import { signedIn as test } from './support/session'

test.describe.configure({ mode: 'serial' })

/** Favorita pela estrela da página do item (desfaz antes, se já era favorito) e devolve o título dele. */
async function favorite (page: Page, path: string): Promise<string> {
  await page.goto(path)
  const title = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? ''
  const star = page.getByTestId('favorite-button')
  await expect(star).toBeVisible()
  if ((await star.getAttribute('aria-pressed')) === 'true') {
    await star.click()
    await expect(star).toHaveAttribute('aria-pressed', 'false')
  }
  await star.click()
  await expect(star).toHaveAttribute('aria-pressed', 'true')
  return title
}

test('favorita um álbum e uma música, e cada um aparece no grupo dele na vitrine do perfil', async ({ page, pageErrors }) => {
  const album = await favorite(page, `/albums/${SAMPLE.album}`)
  const track = await favorite(page, `/tracks/${SAMPLE.track}`)

  await page.goto('/me')
  const shelf = page.getByTestId('favorites-shelf')
  await expect(shelf.getByTestId('favorites-shelf-group-album')).toContainText(album)
  await expect(shelf.getByTestId('favorites-shelf-group-track')).toContainText(track)
  await expect(shelf.getByTestId('favorites-shelf-group-album')).not.toContainText(track)
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
