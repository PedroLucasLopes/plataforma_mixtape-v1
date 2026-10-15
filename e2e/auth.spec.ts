import { newAccount, newPassword, register, registerAndEnter, signIn } from './support/accounts'
import { ANONYMOUS, API_PATHS, SESSION_HEADER } from './support/constants'
import { expect, test } from './support/fixtures'
import { latestMessageTo, linkWithToken, mailpitAvailable } from './support/mailpit'

test('entra pela tela do Mixtape com o usuário e volta para onde ia', async ({ browser, request }) => {
  const account = newAccount('e2e_login')
  await register(request, account)
  const context = await browser.newContext(ANONYMOUS)
  const page = await context.newPage()
  await page.goto('/login?redirect=%2Fcharts')
  await page.getByTestId('page-login-login').locator('input').fill(`@${account.username}`)
  await page.getByTestId('page-login-password').locator('input').fill(account.password)
  await page.getByTestId('page-login-submit').click()
  await expect(page.getByTestId('layout-app-user-menu')).toBeVisible()
  await expect(page).toHaveURL(/\/charts$/)
  await context.close()
})

test('senha errada e conta que não existe dão o mesmo erro, sem sair do formulário', async ({ page, request }) => {
  const account = newAccount('e2e_wrong')
  await register(request, account)
  await page.goto('/login')
  await page.getByTestId('page-login-login').locator('input').fill(account.email)
  await page.getByTestId('page-login-password').locator('input').fill(`${account.password}x`)
  await page.getByTestId('page-login-submit').click()
  const error = page.getByTestId('page-login-error')
  await expect(error).toBeVisible()
  const wrongPassword = await error.textContent()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByTestId('page-login-password').locator('input')).toHaveValue('')

  await page.getByTestId('page-login-login').locator('input').fill(`ninguem-${account.email}`)
  await page.getByTestId('page-login-password').locator('input').fill(account.password)
  await page.getByTestId('page-login-submit').click()
  await expect(error).toHaveText(wrongPassword ?? '')
})

test('o login pede o que falta antes de enviar', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('page-login-submit').click()
  await expect(page.getByTestId('page-login-login')).toContainText('Informe seu e-mail ou nome de usuário.')
  await expect(page.getByTestId('page-login-password')).toContainText('Informe a senha.')
})

test('o olho mostra e esconde a senha', async ({ page }) => {
  await page.goto('/login')
  const field = page.getByTestId('page-login-password')
  await field.locator('input').fill('qualquer-coisa')
  await expect(field.locator('input')).toHaveAttribute('type', 'password')
  await field.getByTestId('mx-password-field-toggle').click()
  await expect(field.locator('input')).toHaveAttribute('type', 'text')
})

test('o link do login para "esqueci a senha" leva o e-mail digitado', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('page-login-login').locator('input').fill('alguem@example.test')
  await page.getByTestId('page-login-forgot').click()
  await expect(page.getByTestId('page-forgot-password')).toBeVisible()
  await expect(page.getByTestId('page-forgot-password-email').locator('input')).toHaveValue('alguem@example.test')
  await expect(page).not.toHaveURL(/example\.test/)
})

test('link sem token mostra o aviso de link inválido', async ({ page }) => {
  await page.goto('/reset-password')
  await expect(page.getByTestId('page-reset-password-request-new')).toBeVisible()
})

test('o cadastro já abre a sessão neste navegador', async ({ browser }) => {
  const context = await browser.newContext(ANONYMOUS)
  const page = await context.newPage()
  await registerAndEnter(page, newAccount('e2e_session'))

  const refresh = await page.request.post(API_PATHS.refresh, { headers: SESSION_HEADER, data: {} })
  expect(refresh.status()).toBe(200)
  await context.close()
})

test('redefine a senha pelo link do e-mail e entra com a nova', async ({ browser, request }) => {
  test.skip(!(await mailpitAvailable(request)), 'precisa da caixa de testes (Mailpit) rodando')
  const account = newAccount('e2e_reset')
  await register(request, account)
  const context = await browser.newContext(ANONYMOUS)
  const page = await context.newPage()

  await page.goto('/forgot-password')
  await page.getByTestId('page-forgot-password-email').locator('input').fill(account.email)
  await page.getByTestId('page-forgot-password-submit').click()
  await expect(page.getByTestId('page-forgot-password-resend')).toBeVisible()

  const link = linkWithToken(await latestMessageTo(request, account.email))
  await page.goto(`${link.pathname}${link.hash}`)
  await expect(page).not.toHaveURL(/token=/)

  const password = newPassword()
  await page.getByTestId('page-reset-password-new-password').locator('input').fill(password)
  await page.getByTestId('page-reset-password-confirm').locator('input').fill(password)
  await page.getByTestId('page-reset-password-submit').click()
  await expect(page.getByTestId('page-login')).toBeVisible()

  await signIn(page, account.email, password)
  await context.close()
})
