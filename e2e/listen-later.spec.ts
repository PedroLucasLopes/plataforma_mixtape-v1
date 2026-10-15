import { expect } from './support/fixtures'
import { signedIn as test } from './support/session'

test.describe.configure({ mode: 'serial' })

const literally = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))

test('guarda um álbum do Descubra para ouvir depois e ele entra na pilha do perfil', async ({ page, pageErrors }) => {
  await page.goto('/me')
  const discover = page.getByTestId('discover-card')
  await expect(discover.getByTestId('mx-crate-record').first()).toBeVisible()
  await discover.getByTestId('mx-crate-pile').click()
  const dialog = page.getByTestId('discover-card-dialog')
  const title = (await dialog.getByTestId('mx-dialog-title').textContent())?.trim() ?? ''
  const save = dialog.getByTestId('listen-later-button')
  if ((await save.getAttribute('aria-pressed')) !== 'true') {
    await save.click()
  }
  await expect(save).toHaveAttribute('aria-pressed', 'true')
  await dialog.getByTestId('mx-dialog-close').click()

  const later = page.getByTestId('listen-later-crate')
  await expect(later.getByRole('option', { name: literally(title) })).toHaveCount(1)
  expect(pageErrors).toEqual([])
})

test('tira da lista pelo disco puxado na caixa do perfil', async ({ page }) => {
  await page.goto('/me')
  const later = page.getByTestId('listen-later-crate')
  await expect(later.getByTestId('mx-crate-record').first()).toBeVisible()
  const total = Number((await later.textContent())?.match(/1 de (\d+)/)?.[1] ?? '1')
  await later.getByTestId('mx-crate-pull').click()
  const save = later.getByTestId('listen-later-button')
  await expect(save).toHaveAttribute('aria-pressed', 'true')
  await save.click()
  await expect(later).toContainText(total === 1 ? 'Nada guardado ainda' : `de ${total - 1}`)
})
