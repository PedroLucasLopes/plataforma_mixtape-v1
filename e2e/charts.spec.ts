import { expect, test } from './support/fixtures'

test('troca entre o mundo e o Mixtape e mostra o pódio do mundo', async ({ page, pageErrors }) => {
  await page.goto('/charts')
  const source = page.getByTestId('page-charts-source')
  await expect(source.getByTestId('mx-segmented-option-world')).toHaveAttribute('aria-checked', 'true')

  const podium = page.getByTestId('page-charts-podium')
  await expect(podium).toBeVisible()
  await expect(podium.getByTestId(/^page-charts-place-[123]$/)).toHaveCount(3)
  await expect(page.getByTestId('page-charts-listenbrainz')).toBeVisible()

  await source.getByTestId('mx-segmented-option-mixtape').click()
  await expect(page).toHaveURL(/source=mixtape/)
  await expect(source.getByTestId('mx-segmented-option-mixtape')).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByTestId('page-charts-listenbrainz')).toBeHidden()
  expect(pageErrors).toEqual([])
})

test('o período escolhido fica na URL e marcado', async ({ page }) => {
  await page.goto('/charts')
  const period = page.getByTestId('page-charts-period')
  await period.getByTestId('mx-segmented-option-month').click()
  await expect(page).toHaveURL(/range=month/)
  await expect(period.getByTestId('mx-segmented-option-month')).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByTestId('page-charts-podium')).toBeVisible()
})

test('o primeiro lugar flutua no meio e mais alto, o segundo à esquerda e o terceiro à direita', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a regra é a mesma; a conferência das posições é no desktop')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/charts')
  const cards = [1, 2, 3].map(position => page.getByTestId(`page-charts-place-${position}`).getByTestId('page-charts-place-card'))
  await expect(cards[0]!).toBeVisible()
  const [first, second, third] = await Promise.all(cards.map(async card => card.boundingBox()))
  expect(first && second && third).toBeTruthy()
  const bottom = (box: { y: number, height: number }) => box.y + box.height
  expect(bottom(first!)).toBeLessThan(bottom(second!))
  expect(bottom(second!)).toBeLessThan(bottom(third!))
  expect(second!.x).toBeLessThan(first!.x)
  expect(first!.x).toBeLessThan(third!.x)
})

test('só o primeiro lugar tem o sol de espinhos, e cada um mostra o número na capa', async ({ page }) => {
  await page.goto('/charts')
  for (const position of [1, 2, 3]) {
    const place = page.getByTestId(`page-charts-place-${position}`)
    await expect(place.getByTestId('mx-starburst')).toHaveCount(position === 1 ? 1 : 0)
    await expect(place.locator('.mx-item-card__position')).toHaveText(String(position))
  }
})
