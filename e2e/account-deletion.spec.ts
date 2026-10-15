import { newAccount, registerAndEnter } from './support/accounts'
import { ANONYMOUS, API_PATHS, SESSION_HEADER } from './support/constants'
import { expect, test } from './support/fixtures'
import { latestMessageTo, linkWithToken, mailpitAvailable } from './support/mailpit'

test('link de exclusão sem token mostra o aviso de link inválido', async ({ page }) => {
  await page.goto('/delete-account')
  await expect(page.getByTestId('page-delete-account-request-new')).toBeVisible()
})

test('exclui a conta pelo link do e-mail, e a sessão dela não volta mais', async ({ browser, request }) => {
  test.skip(!(await mailpitAvailable(request)), 'precisa da caixa de testes (Mailpit) rodando')
  // Conta própria, descartável e em contexto limpo: a do `signedIn` é usada pelos outros testes.
  const context = await browser.newContext(ANONYMOUS)
  const page = await context.newPage()
  const account = newAccount('e2e_delete')
  await registerAndEnter(page, account)

  await page.goto('/settings/account')
  await page.getByTestId('page-account-send-deletion-link').click()
  await expect(page.getByTestId('page-account-deletion-sent')).toBeVisible()
  // Pedir o link não apaga nada: a conta continua aberta.
  await expect(page.getByTestId('layout-app-user-menu')).toBeVisible()

  const link = linkWithToken(await latestMessageTo(request, account.email))
  expect(link.pathname).toBe('/delete-account')
  await page.goto(`${link.pathname}${link.hash}`)
  await expect(page).not.toHaveURL(/token=/)
  await expect(page.getByTestId('page-delete-account-username')).toContainText(account.username)

  await page.getByTestId('page-delete-account-submit').click()
  await expect(page.getByTestId('page-delete-account-done')).toBeVisible()

  // Nenhuma sessão desta conta volta, e a senha dela não entra mais (a identidade saiu do Auth0 junto).
  const refresh = await page.request.post(API_PATHS.refresh, { headers: SESSION_HEADER, data: {} })
  expect(refresh.status()).toBe(401)
  const login = await request.post(API_PATHS.login, { data: { login: account.email, password: account.password } })
  expect(login.status()).toBe(401)
  await context.close()
})
