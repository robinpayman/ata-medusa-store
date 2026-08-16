// jsdom 30 removed its built-in `localStorage`/`sessionStorage` in favor of
// deferring to Node's native implementation, which only works when Node is
// started with a `--localstorage-file` flag pointing at a backing file.
// We don't want tests depending on an on-disk file, so provide a small
// in-memory polyfill whenever a real implementation isn't present.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = new MemoryStorage()
}

if (typeof window !== "undefined" && typeof window.localStorage === "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: globalThis.localStorage,
    writable: true,
  })
}
