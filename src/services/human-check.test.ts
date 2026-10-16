import type { HumanCheckConfig } from '@/types/api'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './http'
import { HumanCheckController, type HumanCheckState, type TurnstileApi } from './human-check'

const ENABLED: HumanCheckConfig = { provider: 'turnstile', siteKey: 'chave-publica', scriptUrl: 'https://desafio.exemplo/api.js' }
const DISABLED: HumanCheckConfig = { provider: null, siteKey: null, scriptUrl: null }
const container = {} as HTMLElement

function fakeTurnstile () {
  const calls = { render: 0, reset: 0, remove: 0 }
  let options: Record<string, (...args: unknown[]) => unknown> = {}
  const api: TurnstileApi = {
    render: (_element, given) => {
      calls.render++
      options = given as typeof options
      return 'widget-1'
    },
    reset: () => {
      calls.reset++
    },
    remove: () => {
      calls.remove++
    },
  }
  return {
    api,
    calls,
    options: () => options,
    solve: (token: string) => options.callback?.(token),
    breaks: () => options['error-callback']?.(),
  }
}

function build (configs: Array<HumanCheckConfig | null>, waitMs = 1000) {
  const turnstile = fakeTurnstile()
  const states: HumanCheckState[] = []
  const config = vi.fn(async () => configs.length > 1 ? configs.shift()! : configs[0]!)
  const load = vi.fn(async () => turnstile.api)
  const controller = new HumanCheckController('login', 'pt-br', state => states.push(state), { config, load, waitMs })
  return { controller, turnstile, states, config, load }
}

describe('prova de que é uma pessoa (Turnstile)', () => {
  it('desligada na API: nada carrega e o envio segue sem token', async () => {
    const { controller, load, states } = build([DISABLED])
    await controller.mount(container)
    expect(states.at(-1)).toBe('off')
    expect(load).not.toHaveBeenCalled()
    await expect(controller.take()).resolves.toBeNull()
  })

  it('monta o desafio invisível, na língua do site e com a ação do formulário', async () => {
    const { controller, turnstile } = build([ENABLED])
    await controller.mount(container)
    expect(turnstile.options()).toMatchObject({
      sitekey: 'chave-publica',
      action: 'login',
      language: 'pt-br',
      appearance: 'interaction-only',
    })
  })

  it('entrega um token por envio: o segundo espera o desafio novo depois do reset', async () => {
    const { controller, turnstile, states } = build([ENABLED])
    await controller.mount(container)
    turnstile.solve('token-1')
    expect(states.at(-1)).toBe('ready')
    await expect(controller.take()).resolves.toBe('token-1')

    const second = controller.take()
    controller.reset()
    expect(turnstile.calls.reset).toBe(1)
    turnstile.solve('token-2')
    await expect(second).resolves.toBe('token-2')
  })

  it('quem envia antes de o desafio terminar espera; se ele não termina, recebe o erro da prova', async () => {
    const { controller, turnstile } = build([ENABLED], 20)
    await controller.mount(container)
    const early = controller.take()
    turnstile.solve('token-a-tempo')
    await expect(early).resolves.toBe('token-a-tempo')

    const late = controller.take()
    await expect(late).rejects.toBeInstanceOf(ApiError)
    await expect(late).rejects.toMatchObject({ code: 'HUMAN_CHECK_REQUIRED' })
  })

  it('desafio que quebra avisa e o envio recebe o erro da prova', async () => {
    const { controller, turnstile, states } = build([ENABLED])
    await controller.mount(container)
    const pending = controller.take()
    turnstile.breaks()
    expect(states.at(-1)).toBe('error')
    await expect(pending).rejects.toMatchObject({ code: 'HUMAN_CHECK_REQUIRED' })
  })

  it('sem resposta da API, tenta de novo no próximo envio', async () => {
    const { controller, turnstile, states, config } = build([null, ENABLED])
    await controller.mount(container)
    expect(states.at(-1)).toBe('error')
    const retried = controller.take()
    await vi.waitFor(() => expect(turnstile.calls.render).toBe(1))
    turnstile.solve('token-depois')
    await expect(retried).resolves.toBe('token-depois')
    expect(config).toHaveBeenCalledTimes(2)
  })

  it('ao sair da página, tira o widget e solta quem esperava', async () => {
    const { controller, turnstile } = build([ENABLED])
    await controller.mount(container)
    const pending = controller.take()
    controller.destroy()
    expect(turnstile.calls.remove).toBe(1)
    await expect(pending).rejects.toMatchObject({ code: 'HUMAN_CHECK_REQUIRED' })
  })
})
