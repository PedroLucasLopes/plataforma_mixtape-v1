// Cliente mínimo da API v4 da Cloudflare para o apply.mjs. O token vem do ambiente e nunca entra em mensagem de erro.

export const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

export class CloudflareError extends Error {
  constructor (method, path, status, detail) {
    super(`${method} ${path}: ${status} ${detail}`)
    this.status = status
  }
}

export class CloudflareApi {
  constructor (token, base = CLOUDFLARE_API_BASE, fetchImpl = fetch) {
    this.token = token
    this.base = base.replace(/\/+$/, '')
    this.fetchImpl = fetchImpl
  }

  async request (method, path, body) {
    const response = await this.fetchImpl(`${this.base}${path}`, {
      method,
      headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.success === false) {
      const detail = (data.errors ?? []).map(error => `${error.code}: ${error.message}`).join('; ')
      throw new CloudflareError(method, path, response.status, detail || response.statusText)
    }
    return data.result
  }

  get (path) {
    return this.request('GET', path)
  }

  /** GET que devolve null em 404 (ex.: a fase de regras ainda sem nada). */
  async find (path) {
    try {
      return await this.get(path)
    } catch (error) {
      if (error instanceof CloudflareError && error.status === 404) {
        return null
      }
      throw error
    }
  }

  put (path, body) {
    return this.request('PUT', path, body)
  }

  post (path, body) {
    return this.request('POST', path, body)
  }

  patch (path, body) {
    return this.request('PATCH', path, body)
  }
}
