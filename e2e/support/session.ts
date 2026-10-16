import { AUTH_STATE } from './constants'
import { test } from './fixtures'

export const signedIn = test.extend({
  storageState: AUTH_STATE,
  context: async ({ context }, use) => {
    await use(context)
    await context.storageState({ path: AUTH_STATE })
  },
})
