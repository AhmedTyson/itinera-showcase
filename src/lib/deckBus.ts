/**
 * deckBus — the ONLY cross-cutting channel for deck ⇄ outside world (D3).
 * Window CustomEvents are forbidden. Typed, tiny, testable.
 */

export interface DeckEvents {
  /** Deck requests a jump; payload = slide id. */
  jump: { id: string }
  /** Deck announces mounted slides so outside callers can resolve ids. */
  register: { ids: string[] }
}

type Handler<K extends keyof DeckEvents> = (payload: DeckEvents[K]) => void
const handlers: { [K in keyof DeckEvents]: Set<Handler<K>> } = {
  jump: new Set(),
  register: new Set(),
}

let mountedIds: readonly string[] = []

export function on<K extends keyof DeckEvents>(k: K, fn: Handler<K>): () => void {
  handlers[k].add(fn as Handler<K>)
  return () => handlers[k].delete(fn as Handler<K>)
}

export function emit<K extends keyof DeckEvents>(k: K, payload: DeckEvents[K]): void {
  handlers[k].forEach((fn) => fn(payload))
}

/** Called by Deck on mount/unmount. */
export function setDeckMounted(ids: readonly string[] | null): void {
  mountedIds = ids ?? []
  if (ids) emit("register", { ids: [...ids] })
}

export function isDeckMounted(): boolean {
  return mountedIds.length > 0
}

export function deckSlideIds(): readonly string[] {
  return mountedIds
}

/**
 * Ask the deck to jump to a slide. Returns false when no deck is mounted
 * or the id is unknown ⇒ caller must fall back to legacy scrollIntoView.
 */
export function requestJump(id: string): boolean {
  if (!isDeckMounted()) return false
  if (!mountedIds.includes(id)) return false
  emit("jump", { id })
  return true
}
