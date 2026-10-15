export const DATA_SOURCES = [
  { name: 'MusicBrainz', url: 'https://musicbrainz.org' },
  { name: 'Cover Art Archive', url: 'https://coverartarchive.org' },
  { name: 'ListenBrainz', url: 'https://listenbrainz.org' },
  { name: 'Wikimedia Commons', url: 'https://commons.wikimedia.org' },
] as const

export const MUSICBRAINZ_URL = 'https://musicbrainz.org'

export const LISTENBRAINZ_URL = 'https://listenbrainz.org'

export type MusicBrainzEntity = 'release' | 'release-group' | 'recording' | 'artist' | 'work'

export const musicBrainzUrl = (entity: MusicBrainzEntity, id: string) => `${MUSICBRAINZ_URL}/${entity}/${encodeURIComponent(id)}`

export const isrcUrl = (isrc: string) => `${MUSICBRAINZ_URL}/isrc/${encodeURIComponent(isrc)}`
