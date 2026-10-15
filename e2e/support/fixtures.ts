import { test as base } from '@playwright/test'
import { IGNORED_CONSOLE_ERRORS } from './constants'

export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (message.type() === 'error' && !IGNORED_CONSOLE_ERRORS.some(pattern => pattern.test(message.text()))) {
        errors.push(message.text())
      }
    })
    await use(errors)
  },
})

export { expect } from '@playwright/test'
