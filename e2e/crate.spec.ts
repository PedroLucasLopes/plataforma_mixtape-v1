import { expect, test } from './support/fixtures'

test('a busca mostra os resultados numa pilha, e o teclado folheia, puxa e devolve', async ({ page, pageErrors }) => {
  await page.goto('/search?q=beatles')
  await page.getByTestId('page-search-view').getByTestId('mx-segmented-option-crate').click()
  await expect(page).toHaveURL(/view=crate/)
  const crate = page.getByTestId('page-search-crate')
  await expect(crate.getByTestId('mx-crate-record').first()).toBeVisible()
  await expect(crate).toContainText(/1 de \d+/)

  await crate.getByTestId('mx-crate-pile').focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(crate).toContainText(/3 de \d+/)
  await page.keyboard.press('Enter')
  await expect(crate.getByTestId('crate-pulled-card-open')).toHaveAttribute('href', /\/albums\//)
  await page.keyboard.press('Escape')
  await expect(crate.getByTestId('mx-crate-pulled')).toBeHidden()
  expect(pageErrors).toEqual([])
})
