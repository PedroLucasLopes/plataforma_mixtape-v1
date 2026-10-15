import { test as setup } from '@playwright/test'
import { newAccount, registerAndEnter, signIn } from './support/accounts'
import { AUTH_STATE } from './support/constants'

setup('entra com a conta dos testes', async ({ page }) => {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD
  await (email && password ? signIn(page, email, password) : registerAndEnter(page, newAccount('e2e')))
  await page.context().storageState({ path: AUTH_STATE })
})
