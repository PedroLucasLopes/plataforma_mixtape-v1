import { type APIRequestContext, expect } from '@playwright/test'
import { E2E } from './constants'

interface MailpitSearch {
  messages: Array<{ ID: string }>
}

interface MailpitMessage {
  Text: string
}

export async function mailpitAvailable (request: APIRequestContext): Promise<boolean> {
  try {
    return (await request.get(`${E2E.mailpitUrl}/api/v1/info`)).ok()
  } catch {
    return false
  }
}

export async function latestMessageTo (request: APIRequestContext, address: string): Promise<string> {
  let id = ''
  await expect.poll(async () => {
    const response = await request.get(`${E2E.mailpitUrl}/api/v1/search`, { params: { query: `to:"${address}"` } })
    const found = (await response.json()) as MailpitSearch
    id = found.messages[0]?.ID ?? ''
    return id
  }, { message: `e-mail para ${address}`, timeout: E2E.mailTimeoutMs }).not.toBe('')
  const message = (await (await request.get(`${E2E.mailpitUrl}/api/v1/message/${id}`)).json()) as MailpitMessage
  return message.Text
}

export function linkWithToken (text: string): URL {
  const match = /https?:\/\/\S+#token=[\w.-]+/.exec(text)
  if (!match) {
    throw new Error('O e-mail não trouxe o link com o token.')
  }
  return new URL(match[0])
}
