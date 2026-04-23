import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

// Polyfill localStorage for jsdom environments that don't fully implement it
if (typeof localStorage === 'undefined' || typeof localStorage.clear !== 'function') {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = String(v);
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach(k => delete store[k]);
      },
      get length() {
        return Object.keys(store).length;
      },
    },
    writable: true,
  });
}
