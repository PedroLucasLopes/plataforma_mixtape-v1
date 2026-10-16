import { randomBytes } from 'node:crypto'
import { type APIRequestContext, expect, type Page } from '@playwright/test'
import { API_PATHS, HUMAN_CHECK_HEADER, SESSION_HEADER, SESSION_HINT, TEST_PROFILE } from './constants'

export interface TestAccount {
  email: string
  username: string
  password: string
}

export function newAccount (prefix: string): TestAccount {
  const username = `${prefix}_${randomBytes(4).toString('hex')}`
  return {
    email: `${username}@example.test`,
    username,
    password: `${randomBytes(12).toString('base64url')}#7a`,
  }
}

export function newPassword (): string {
  return `${randomBytes(12).toString('base64url')}!9b`
}

function profileOf (account: TestAccount) {
  return { ...TEST_PROFILE, email: account.email, username: account.username, password: account.password }
}

export async function register (request: APIRequestContext, account: TestAccount): Promise<void> {
  const response = await request.post(API_PATHS.register, { data: profileOf(account), headers: HUMAN_CHECK_HEADER })
  expect(response.status(), `cadastro de ${account.username}`).toBe(201)
}

export async function registerAndEnter (page: Page, account: TestAccount): Promise<void> {
  const response = await page.request.post(API_PATHS.register, { data: profileOf(account), headers: { ...SESSION_HEADER, ...HUMAN_CHECK_HEADER } })
  expect(response.status(), `cadastro de ${account.username}`).toBe(201)
  await page.goto('/')
  await page.evaluate(({ key, value }) => globalThis.localStorage.setItem(key, value), SESSION_HINT)
  await page.reload()
  await expect(page.getByTestId('layout-app-user-menu')).toBeVisible()
}

export async function signIn (page: Page, login: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByTestId('page-login-login').locator('input').fill(login)
  await page.getByTestId('page-login-password').locator('input').fill(password)
  await page.getByTestId('page-login-submit').click()
  await expect(page.getByTestId('layout-app-user-menu')).toBeVisible()
}
