import type { HumanCheckAction, HumanCheckConfig } from '@/types/api'
import { HUMAN_CHECK } from '@/constants/api'
import { ApiError, describeError } from './http'
import { authApi } from './mixtape'

/** O pedaço da API do Turnstile (script da Cloudflare) que o site usa. */
export interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string | undefined
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

/** `off`: a API não pede; `loading`: o desafio está rodando; `ready`: há token; `error`: não carregou. */
export type HumanCheckState = 'loading' | 'off' | 'ready' | 'error'

let config: Promise<HumanCheckConfig | null> | null = null
let script: Promise<TurnstileApi | null> | null = null

/** Uma pergunta por visita: a API diz se login, cadastro e "esqueci a senha" pedem o desafio. Falha não fica guardada. */
export function humanCheckConfig (): Promise<HumanCheckConfig | null> {
  config ??= authApi.humanCheck().catch(() => {
    config = null
    return null
  })
  return config
}

/**
 * Carrega o script do Turnstile uma vez, com render=explicit (o desafio só aparece onde a página pedir). Ele entra
 * pela CSP do site porque quem o cria é o nosso próprio script, que tem o nonce ('strict-dynamic').
 */
export function loadTurnstile (scriptUrl: string): Promise<TurnstileApi | null> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }
  script ??= new Promise(resolve => {
    const url = new URL(scriptUrl)
    url.searchParams.set('render', 'explicit')
    const element = document.createElement('script')
    element.src = url.toString()
    element.async = true
    element.addEventListener('load', () => resolve(window.turnstile ?? null))
    element.addEventListener('error', () => {
      script = null
      element.remove()
      resolve(null)
    })
    document.head.append(element)
  })
  return script
}

function required (): ApiError {
  return new ApiError(403, describeError(403, 'HUMAN_CHECK_REQUIRED'), 'HUMAN_CHECK_REQUIRED')
}

export interface HumanCheckDeps {
  config: () => Promise<HumanCheckConfig | null>
  load: (scriptUrl: string) => Promise<TurnstileApi | null>
  waitMs: number
}

const DEFAULT_DEPS: HumanCheckDeps = { config: humanCheckConfig, load: loadTurnstile, waitMs: HUMAN_CHECK.waitMs }

type Waiter = (token: string | null) => void

/**
 * O desafio de um formulário. Monta o widget, que fica invisível a não ser que a Cloudflare peça interação, guarda o
 * token e entrega um por envio. O token só vale uma vez: depois de cada envio que falhou, `reset()` pede outro.
 */
export class HumanCheckController {
  private token: string | null = null
  private widgetId: string | null = null
  private turnstile: TurnstileApi | null = null
  private container: HTMLElement | null = null
  private waiters: Waiter[] = []
  private state: HumanCheckState = 'loading'

  constructor (
    private readonly action: HumanCheckAction,
    private readonly language: string,
    private readonly onState: (state: HumanCheckState) => void,
    private readonly deps: HumanCheckDeps = DEFAULT_DEPS,
  ) {}

  async mount (container: HTMLElement): Promise<void> {
    this.container = container
    this.setState('loading')
    const settings = await this.deps.config()
    if (!settings) {
      return this.fail()
    }
    if (!settings.provider || !settings.siteKey || !settings.scriptUrl) {
      return this.setState('off')
    }
    const turnstile = await this.deps.load(settings.scriptUrl)
    if (!turnstile || !this.container) {
      return this.fail()
    }
    this.turnstile = turnstile
    this.widgetId = turnstile.render(this.container, {
      'sitekey': settings.siteKey,
      'action': this.action,
      'theme': 'auto',
      'language': this.language,
      'appearance': 'interaction-only',
      'size': 'flexible',
      'refresh-expired': 'auto',
      'callback': (token: string) => this.solved(token),
      'expired-callback': () => this.forget(),
      'timeout-callback': () => this.forget(),
      'error-callback': () => {
        this.fail()
        return true
      },
    }) ?? null
  }

  /** O token para o próximo envio: espera o desafio terminar e recusa com HUMAN_CHECK_REQUIRED se não terminar. */
  take (): Promise<string | null> {
    if (this.state === 'off') {
      return Promise.resolve(null)
    }
    if (this.token) {
      const token = this.token
      this.token = null
      return Promise.resolve(token)
    }
    if (this.state === 'error') {
      void this.retry()
    }
    return new Promise((resolve, reject) => {
      const settle: Waiter = token => {
        clearTimeout(timer)
        this.waiters = this.waiters.filter(waiter => waiter !== settle)
        if (token) {
          resolve(token)
        } else {
          reject(required())
        }
      }
      const timer = setTimeout(() => settle(null), this.deps.waitMs)
      this.waiters.push(settle)
    })
  }

  /** Pede um desafio novo (o token anterior já foi usado ou a API recusou). */
  reset (): void {
    this.token = null
    if (this.turnstile && this.widgetId) {
      this.setState('loading')
      this.turnstile.reset(this.widgetId)
    }
  }

  /** Depois de um erro: tenta de novo do começo (configuração e script) ou só o desafio. */
  async retry (): Promise<void> {
    if (this.turnstile && this.widgetId) {
      return this.reset()
    }
    if (this.container) {
      await this.mount(this.container)
    }
  }

  destroy (): void {
    if (this.turnstile && this.widgetId) {
      this.turnstile.remove(this.widgetId)
    }
    this.widgetId = null
    this.container = null
    for (const waiter of this.waiters) {
      waiter(null)
    }
  }

  private solved (token: string): void {
    this.setState('ready')
    const waiter = this.waiters[0]
    if (waiter) {
      waiter(token)
    } else {
      this.token = token
    }
  }

  private forget (): void {
    this.token = null
  }

  private fail (): void {
    this.token = null
    this.setState('error')
    for (const waiter of this.waiters) {
      waiter(null)
    }
  }

  private setState (state: HumanCheckState): void {
    this.state = state
    this.onState(state)
  }
}
