import { AUTH_STATE } from './constants'
import { test } from './fixtures'

/**
 * A API troca o refresh token a cada uso: o teste que abre a página consome o token salvo. Cada teste
 * autenticado guarda, ao terminar, a sessão como ficou, e o próximo começa dela (por isso workers: 1).
 */
export const signedIn = test.extend({
  storageState: AUTH_STATE,
  context: async ({ context }, use) => {
    await use(context)
    await context.storageState({ path: AUTH_STATE })
  },
})
