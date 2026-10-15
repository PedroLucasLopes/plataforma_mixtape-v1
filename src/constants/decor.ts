/**
 * Tamanho dos blobs soltos (`MxBlob`), relativo à largura do bloco onde estão: num herói largo, o blob
 * cresce junto e não deixa o resto do bloco vazio; num estreito, fica no mínimo.
 */
export const BLOB_SIZE = {
  groupHero: 'clamp(260px, 42%, 600px)',
  homeCta: 'clamp(280px, 44%, 640px)',
} as const
