export type LegalDocument = 'privacy' | 'terms'

export const LEGAL_UPDATED_AT = '2026-10-16'

export const LEGAL_SECTIONS: Readonly<Record<LegalDocument, readonly string[]>> = {
  privacy: ['controller', 'data', 'purposes', 'cookies', 'ads', 'sharing', 'retention', 'rights', 'security', 'children', 'changes', 'contact'],
  terms: ['acceptance', 'account', 'content', 'conduct', 'catalog', 'gamification', 'ads', 'liability', 'termination', 'changes', 'contact'],
}

export const LEGAL_CONTACT_EMAIL: string | null = import.meta.env.VITE_CONTACT_EMAIL?.trim() || null
