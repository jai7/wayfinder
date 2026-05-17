import { afterEach, vi } from "vitest";

// Vitest v4 uses Node.js's native localStorage (node:internal/webstorage) which
// requires --localstorage-file to work. Override it with a reliable in-memory impl.
class InMemoryStorage {
  constructor() { this._store = {}; }
  setItem(key, val) { this._store[key] = String(val); }
  getItem(key) { return key in this._store ? this._store[key] : null; }
  removeItem(key) { delete this._store[key]; }
  clear() { this._store = {}; }
  get length() { return Object.keys(this._store).length; }
  key(n) { return Object.keys(this._store)[n] ?? null; }
}

const inMemoryLS = new InMemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: inMemoryLS,
  writable: true,
  configurable: true,
});

afterEach(() => {
  inMemoryLS.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});
